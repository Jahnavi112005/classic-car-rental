import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    type: { type: String, enum: ['driving_license', 'aadhaar', 'passport', 'other'], default: 'other' },
    fileUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    ocr: { type: Object, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
