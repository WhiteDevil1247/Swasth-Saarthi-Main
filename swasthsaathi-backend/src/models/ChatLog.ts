import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatLog extends Document {
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

const ChatLogSchema = new Schema<IChatLog>({
  user_id: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export const ChatLog: Model<IChatLog> =
  mongoose.models.ChatLog || mongoose.model<IChatLog>('ChatLog', ChatLogSchema);
