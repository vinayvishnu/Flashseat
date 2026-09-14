import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  stadiumId: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  basePrice: number;
  createdAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    stadiumId: { type: Schema.Types.ObjectId, ref: 'Stadium', required: true, index: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    basePrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', EventSchema);
