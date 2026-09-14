import { producer } from '../config/kafka';

/**
 * Service to publish events to Kafka topics
 */
export const publishBookingCreated = async (payload: {
  bookingId: string;
  userId: string;
  eventId: string;
  seatId: string;
  section: string;
  seatNumber: string;
  status: string;
}): Promise<void> => {
  try {
    await producer.send({
      topic: 'booking.created',
      messages: [
        {
          key: payload.bookingId,
          value: JSON.stringify(payload),
        },
      ],
    });
    console.log(`📢 Kafka Event: booking.created published for booking ${payload.bookingId}`);
  } catch (error) {
    console.error('❌ Failed to publish Kafka Event (booking.created):', error);
    throw error;
  }
};
