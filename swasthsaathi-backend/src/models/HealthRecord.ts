import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHealthRecord extends Document {
  user_id: string;
  file_id: string; // filename from multer storage
  original_name?: string;
  file_type?: string;
  created_at: Date;
}

const HealthRecordSchema = new Schema<IHealthRecord>({
  user_id: { type: String, required: true, index: true },
  file_id: { type: String, required: true },
  original_name: { type: String },
  file_type: { type: String },
  created_at: { type: Date, default: Date.now },
});

export const HealthRecord: Model<IHealthRecord> =
  mongoose.models.HealthRecord || mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema);
