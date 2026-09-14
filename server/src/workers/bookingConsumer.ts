import { kafka } from '../config/kafka';
import Booking from '../models/Booking';
import Seat from '../models/Seat';
import { releaseLock } from '../services/redisLockService';
import { io } from '../index';

const consumer = kafka.consumer({ groupId: 'booking-workers' });

export const startBookingConsumer = async (): Promise<void> => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'booking.created', fromBeginning: true });
    console.log('📥 Kafka Booking Consumer Connected and listening on booking.created...');

    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const payload = JSON.parse(message.value.toString());
        const { bookingId, userId, eventId, seatId, seatNumber } = payload;

        console.log(`⏳ Processing booking ${bookingId} for seat ${seatNumber} by user ${userId}...`);

        try {
          // 1. Create the Pending Booking in MongoDB
          const booking = await Booking.create({
            _id: bookingId,
            userId,
            seatId,
            eventId,
            status: 'PENDING',
            paymentStatus: 'PENDING',
          });

          // Emit progress to the specific user's room (room name = bookingId)
          io.to(bookingId).emit('booking:progress', {
            bookingId,
            status: 'PENDING',
            message: 'Seat lock confirmed. Initializing payment processing...',
          });

          // 2. Simulate Payment Gateway Gateway Call (takes 2 seconds)
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Mock Payment Failure rule: seat numbers ending in "09" will fail payment
          const isPaymentSuccessful = !seatNumber.endsWith('09');

          if (isPaymentSuccessful) {
            // --- SUCCESS FLOW ---
            // A. Update Booking in DB to CONFIRMED
            booking.status = 'CONFIRMED';
            booking.paymentStatus = 'COMPLETED';
            await booking.save();

            // B. Update Seat in DB to SOLD
            await Seat.findByIdAndUpdate(seatId, { status: 'SOLD' });

            // C. Release Redis Lock (Seat is now permanently marked SOLD in DB, lock no longer needed)
            await releaseLock(eventId, seatNumber, userId);

            console.log(`✅ Booking CONFIRMED for seat ${seatNumber}`);

            // D. Emit success updates to client
            io.to(bookingId).emit('booking:progress', {
              bookingId,
              status: 'CONFIRMED',
              message: 'Payment successful! Your ticket has been generated.',
            });
            io.to(bookingId).emit('payment:success', { bookingId, seatNumber });

            // E. Broadcast seat state update globally to update other users' maps
            io.emit('seat:update', { eventId, seatNumber, status: 'SOLD' });
          } else {
            // --- FAILURE (SAGA ROLLBACK) FLOW ---
            console.log(`❌ Payment failed for seat ${seatNumber}. Initiating Saga rollback...`);

            // A. Update Booking in DB to FAILED
            booking.status = 'FAILED';
            booking.paymentStatus = 'PENDING'; // Or failed
            await booking.save();

            // B. Ensure Seat in DB remains AVAILABLE
            await Seat.findByIdAndUpdate(seatId, { status: 'AVAILABLE' });

            // C. Release Redis Lock (Crucial: makes the seat bookable again immediately)
            await releaseLock(eventId, seatNumber, userId);

            // D. Emit failure progress update to client
            io.to(bookingId).emit('booking:progress', {
              bookingId,
              status: 'FAILED',
              message: 'Payment failed. Your reservation has been released.',
            });
            io.to(bookingId).emit('notification:new', {
              message: `Payment failed for seat ${seatNumber}. The seat has been released.`,
            });

            // E. Broadcast seat state update globally as AVAILABLE
            io.emit('seat:update', { eventId, seatNumber, status: 'AVAILABLE' });
          }
        } catch (dbError) {
          console.error(`❌ Database processing error for booking ${bookingId}:`, dbError);
          // Release lock just in case to avoid leaving the seat frozen
          await releaseLock(eventId, seatNumber, userId);
        }
      },
    });
  } catch (error) {
    console.error('❌ Kafka Consumer Execution Error:', error);
  }
};
