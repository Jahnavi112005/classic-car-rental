import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: mongoose.Schema.Types.Mixed, required: true },
    yearRange: { type: String, default: '' },
    fuel_type: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'], required: true },
    transmission: { type: String, enum: ['Manual', 'Automatic'], required: true },
    seats: { type: Number, required: true },
    price_per_day: { type: Number, required: true },
    category: { type: String, enum: ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Premium Luxury'], required: true },
    featured: { type: Boolean, default: false },
    description: { type: String, default: '' },
    images: [{ type: String }],
    features: [{ type: String }],
    availability: { type: Boolean, default: true },
    security_deposit: { type: Number, default: 5000 },
    rating: { type: Number, default: 4.5 },
    reviews_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Vehicle', vehicleSchema);
