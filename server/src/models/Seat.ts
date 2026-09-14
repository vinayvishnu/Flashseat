import mongoose, { Schema, Document } from 'mongoose';

export interface ISeat extends Document {
  eventId: mongoose.Types.ObjectId;
  section: string;
  seatNumber: string;
  status: 'AVAILABLE' | 'LOCKED' | 'SOLD';
  price: number;
  createdAt: Date;
}

const SeatSchema: Schema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    section: { type: String, required: true },
    seatNumber: { type: String, required: true },
    status: { type: String, enum: ['AVAILABLE', 'LOCKED', 'SOLD'], default: 'AVAILABLE', index: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of a seat within a single event
SeatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model<ISeat>('Seat', SeatSchema);
