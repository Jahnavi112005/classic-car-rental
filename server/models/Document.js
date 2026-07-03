import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    type: { type: String, enum: ['driving_license', 'aadhaar', 'passport', 'pan', 'other'], default: 'other' },
    fileUrl: { type: String, required: true },
    originalImageUrl: { type: String, default: '' },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    ocrText: { type: String, default: '' },
    parsedFields: { type: Object, default: {} },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'restricted'], default: 'pending' },
    verificationNotes: { type: String, default: '' },
    verificationMessage: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    ocr: { type: Object, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
