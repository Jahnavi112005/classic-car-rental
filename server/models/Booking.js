import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
