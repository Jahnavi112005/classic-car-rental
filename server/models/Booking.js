import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    car_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    pickup_location: { type: String, required: true },
    drop_location: { type: String, required: true },
    pickup_date: { type: String, required: true },
    drop_date: { type: String, required: true },
    pickup_time: { type: String, default: '10:00' },
    drop_time: { type: String, default: '10:00' },
    total_days: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    security_deposit: { type: Number, default: 5000 },
    booking_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    payment_status: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    notes: [
      {
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    documentUrl: { type: String, default: '' },
    documentOriginalName: { type: String, default: '' },
    documentMimeType: { type: String, default: '' },
    documentSize: { type: Number, default: 0 },
    verification_status: { type: String, enum: ['pending', 'partial', 'verified'], default: 'pending' },
    timeline: [
      {
        event: { type: String },
        ts: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        meta: { type: Object },
      },
    ],
    status_history: [
      {
        from: { type: String },
        to: { type: String },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
        ts: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
