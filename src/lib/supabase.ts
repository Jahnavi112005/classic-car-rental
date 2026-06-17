import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let _supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Supabase client not initialized. Using fallback no-op client.');

  const noopResponse = { data: null, error: null };

  const chainableObj: any = {
    select() { return this; },
    insert() { return this; },
    update() { return this; },
    delete() { return this; },
    maybeSingle() { return this; },
    rpc() { return Promise.resolve(noopResponse); },
    eq() { return this; },
    order() { return this; },
    limit() { return this; },
    range() { return this; },
    like() { return this; },
    ilike() { return this; },
    neq() { return this; },
    then(resolve: any) { resolve(noopResponse); return Promise.resolve(noopResponse); },
    catch() { return Promise.resolve(noopResponse); },
  };

  const fallback = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: null, error: null }),
      signInWithPassword: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => chainableObj,
    rpc: () => Promise.resolve(noopResponse),
  } as any;

  _supabase = fallback;
}

export const supabase = _supabase as any;

export type Profile = {
  id: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type Car = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG';
  transmission: 'Manual' | 'Automatic';
  seats: number;
  price_per_day: number;
  category: 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury' | 'Premium Luxury';
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
  user_id: string;
  car_id: string;
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
