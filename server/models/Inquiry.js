import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
    vehicle_interested: { type: String, default: '' },
    pickup_date: { type: String, default: null },
    drop_date: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Inquiry', inquirySchema);
