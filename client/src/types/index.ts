export type AppUser = {
  id: string;
  email: string;
};

export type Session = {
  token: string;
  user: AppUser;
};

export type Profile = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'user' | 'admin';
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type Car = {
  id: string | number;
  _id?: string;
  name: string;
  brand: string;
  model: string;
  year: number | string;
  yearRange?: string;
  fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
  transmission: 'Manual' | 'Automatic';
  seats: number;
  price_per_day: number;
  category: 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury' | 'Premium Luxury';
  featured?: boolean;
  description: string;
  images: string[];
  features: string[];
  availability: boolean;
  security_deposit: number;
  rating: number;
  reviews_count: number;
  created_at: string;
};

export type Booking = {
  id: string;
  bookingId?: string;
  document?: string | null;
  user_id: string;
  car_id: string | number;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  drop_date: string;
  pickup_time: string;
  drop_time: string;
  total_days: number;
  total_amount: number;
  security_deposit: number;
  booking_status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  notes: string;
  documents?: Array<{
    id: string;
    fileUrl: string;
    ocr?: Record<string, unknown>;
  }>;
  verification_status?: 'pending' | 'partial' | 'verified';
  customers?: {
    id?: string;
    customerId?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  timeline?: Array<{ event: string; ts: string; by?: { id?: string; name?: string } ; meta?: Record<string, unknown> }>;
  status_history?: Array<{ from?: string; to?: string; by?: { id?: string; name?: string }; note?: string; ts?: string }>;
  created_at: string;
  cars?: Car;
  profiles?: Profile;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar_url: string;
  car_rented: string;
  is_featured: boolean;
  created_at: string;
};

export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  vehicle_interested?: string;
  pickup_date?: string | null;
  drop_date?: string | null;
  created_at: string;
};
