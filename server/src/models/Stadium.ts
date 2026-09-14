import mongoose, { Schema, Document } from 'mongoose';

export interface IStadium extends Document {
  name: string;
  city: string;
  sections: string[];
  createdAt: Date;
}

const StadiumSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    sections: { type: [String], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStadium>('Stadium', StadiumSchema);
