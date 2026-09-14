import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/authMiddleware';
import Seat from '../models/Seat';
import Booking from '../models/Booking';
import { acquireLock, releaseLock } from '../services/redisLockService';
import { publishBookingCreated } from '../services/kafkaProducerService';
import { io } from '../index';

// @desc    Start a seat booking (Acquires Redis lock & queues transaction via Kafka)
// @route   POST /api/v1/booking/start
// @access  Private
export const startBooking = async (req: AuthRequest, res: Response): Promise<Response> => {
  const { eventId, seatNumber } = req.body;
  const userId = req.user?._id?.toString();

  try {
    if (!eventId || !seatNumber) {
      return res.status(400).json({ success: false, error: 'Please provide eventId and seatNumber' });
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // 1. Validate Seat Existence and Status in DB
    const seat = await Seat.findOne({ eventId, seatNumber });
    if (!seat) {
      return res.status(404).json({ success: false, error: 'Seat not found' });
    }

    if (seat.status !== 'AVAILABLE') {
      return res.status(409).json({ success: false, error: 'Seat is already locked or sold' });
    }

    // 2. Try to Acquire Redis Lock (5-minute TTL)
    const lockAcquired = await acquireLock(eventId, seatNumber, userId);
    if (!lockAcquired) {
      return res.status(409).json({ success: false, error: 'Seat is currently being booked by another user' });
    }

    // Broadcast seat locked status in real-time
    io.emit('seat:update', { eventId, seatNumber, status: 'LOCKED' });

    // 3. Generate a booking ID synchronously to return to the client
    const bookingId = new mongoose.Types.ObjectId().toString();

    // 4. Publish Event to Kafka booking.created Topic
    try {
      await publishBookingCreated({
        bookingId,
        userId,
        eventId,
        seatId: seat._id.toString(),
        section: seat.section,
        seatNumber: seat.seatNumber,
        status: 'PENDING',
      });
    } catch (kafkaError) {
      // If Kafka publishing fails, release the Redis lock immediately to keep the seat free
      console.error('❌ Failed to publish to Kafka. Releasing Redis lock...');
      await releaseLock(eventId, seatNumber, userId);
      // Broadcast seat back to available
      io.emit('seat:update', { eventId, seatNumber, status: 'AVAILABLE' });
      return res.status(500).json({ success: false, error: 'Event queue is currently unavailable. Please try again.' });
    }

    // Return 202 Accepted (queued for processing)
    return res.status(202).json({
      success: true,
      data: {
        bookingId,
        eventId,
        seatNumber,
        message: 'Your booking request has been queued. Please listen for real-time updates.',
      },
    });
  } catch (error) {
    console.error('❌ Start Booking Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
