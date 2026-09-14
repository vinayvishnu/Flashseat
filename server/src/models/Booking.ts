import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  seatId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'REFUNDED';
  createdAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seatId: { type: Schema.Types.ObjectId, ref: 'Seat', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED'], default: 'PENDING', index: true },
    paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'REFUNDED'], default: 'PENDING' },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
