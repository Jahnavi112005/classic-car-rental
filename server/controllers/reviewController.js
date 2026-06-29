import Review from '../models/Review.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listToClient } from '../utils/format.js';

const fallbackReviews = [
  { id: '1', name: 'Rajesh Kumar', location: 'Bengaluru', rating: 5, comment: 'Absolutely amazing experience! Booked a BMW 5 Series for my anniversary trip to Mysore. The car was immaculate, and the service was top-notch.', avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', car_rented: 'BMW 5 Series', is_featured: true, created_at: '' },
  { id: '2', name: 'Priya Sharma', location: 'Chennai', rating: 5, comment: 'Rented a Creta for a family trip to Coorg. Seamless booking, clean car, and exceptional customer support. Will definitely rent again!', avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', car_rented: 'Hyundai Creta', is_featured: true, created_at: '' },
  { id: '3', name: 'Arjun Nair', location: 'Mysore', rating: 5, comment: 'Best car rental in Mysore! The Fortuner was in perfect condition. No hidden charges, transparent pricing. Perfect for our Ooty road trip.', avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150', car_rented: 'Toyota Fortuner', is_featured: true, created_at: '' },
];

export const listReviews = asyncHandler(async (req, res) => {
  const filter = req.query.featured === 'true' ? { is_featured: true } : {};
  const limit = Number(req.query.limit || 20);
  const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(limit);
  res.json(reviews.length ? listToClient(reviews) : fallbackReviews.slice(0, limit));
});
