import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    method: { type: String, default: '' },
    transactionId: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
