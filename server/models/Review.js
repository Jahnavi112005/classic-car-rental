import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    name: { type: String, required: true },
    location: { type: String, default: 'Mysore' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    avatar_url: { type: String, default: '' },
    car_rented: { type: String, default: '' },
    is_featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
