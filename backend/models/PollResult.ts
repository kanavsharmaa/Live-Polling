import mongoose, { Schema, Document } from 'mongoose';

export interface IPollResult extends Document {
  teacherId: string;
  question: string;
  options: { text: string, votes: number }[];
  createdAt: Date;
}

const PollResultSchema: Schema = new Schema({
  teacherId: { type: String, required: true },
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    votes: { type: Number, required: true, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPollResult>('PollResult', PollResultSchema); 