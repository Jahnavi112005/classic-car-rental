-- Users profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG')),
  transmission TEXT NOT NULL CHECK (transmission IN ('Manual', 'Automatic')),
  seats INTEGER NOT NULL,
  price_per_day INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Hatchback', 'Sedan', 'SUV', 'Luxury', 'Premium Luxury')),
  description TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  availability BOOLEAN DEFAULT TRUE,
  security_deposit INTEGER DEFAULT 5000,
  rating NUMERIC(3,1) DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  drop_location TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  drop_date DATE NOT NULL,
  pickup_time TEXT DEFAULT '10:00',
  drop_time TEXT DEFAULT '10:00',
  total_days INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  security_deposit INTEGER DEFAULT 5000,
  booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT DEFAULT 'Mysore',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  car_rented TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Cars policies (public read, admin write)
CREATE POLICY "public_select_cars" ON cars FOR SELECT USING (TRUE);
CREATE POLICY "admin_insert_cars" ON cars FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_update_cars" ON cars FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_delete_cars" ON cars FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings policies
CREATE POLICY "select_own_bookings" ON bookings FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "insert_own_bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_bookings" ON bookings FOR UPDATE TO authenticated USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "delete_own_bookings" ON bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Testimonials policies (public read)
CREATE POLICY "public_select_testimonials" ON testimonials FOR SELECT USING (TRUE);
CREATE POLICY "admin_insert_testimonials" ON testimonials FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_update_testimonials" ON testimonials FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_delete_testimonials" ON testimonials FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Inquiries policies
CREATE POLICY "insert_inquiries" ON inquiries FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "admin_select_inquiries" ON inquiries FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_update_inquiries" ON inquiries FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin_delete_inquiries" ON inquiries FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed cars data
INSERT INTO cars (name, brand, model, year, fuel_type, transmission, seats, price_per_day, category, description, images, features, availability, security_deposit, rating) VALUES
('i10 Sportz', 'Hyundai', 'i10', 2019, 'Petrol', 'Manual', 5, 1799, 'Hatchback', 'Compact and fuel-efficient city car. Perfect for navigating Mysore''s heritage streets.', ARRAY['https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['AC', 'Music System', 'Power Windows', 'Central Lock'], TRUE, 3000, 4.3),
('Swift ZXI', 'Maruti Suzuki', 'Swift', 2023, 'Petrol', 'Manual', 5, 2499, 'Hatchback', 'India''s favourite hatchback with sporty looks and efficient performance.', ARRAY['https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['AC', 'Music System', 'Power Windows', 'Rear Camera'], TRUE, 5000, 4.6),
('Honda City ZX', 'Honda', 'City', 2016, 'Petrol', 'Manual', 5, 2499, 'Sedan', 'Premium sedan with comfortable interiors and excellent highway performance.', ARRAY['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['AC', 'Sunroof', 'Leather Seats', 'Navigation', 'Rear Camera'], TRUE, 5000, 4.5),
('Verna SX', 'Hyundai', 'Verna', 2019, 'Diesel', 'Manual', 5, 2499, 'Sedan', 'Stylish and feature-rich sedan with powerful diesel engine.', ARRAY['https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['AC', 'Sunroof', 'Navigation', 'Rear Camera', 'Cruise Control'], TRUE, 5000, 4.4),
('Creta SX', 'Hyundai', 'Creta', 2020, 'Petrol', 'Automatic', 5, 2999, 'SUV', 'India''s best-selling SUV with panoramic sunroof and connected car features.', ARRAY['https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['Panoramic Sunroof', 'Navigation', 'Wireless Charging', 'BOSE Audio', 'Ventilated Seats'], TRUE, 8000, 4.7),
('Mahindra Thar LX', 'Mahindra', 'Thar', 2023, 'Diesel', 'Manual', 4, 4999, 'SUV', 'The ultimate adventure SUV. Explore Coorg, Ooty and beyond with this beast.', ARRAY['https://images.pexels.com/photos/1637859/pexels-photo-1637859.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['4x4', 'Convertible Top', 'Off-road Mode', 'Adventure Ready'], TRUE, 10000, 4.8),
('Toyota Fortuner', 'Toyota', 'Fortuner', 2015, 'Diesel', 'Automatic', 7, 4299, 'Premium Luxury', 'Commanding presence with supreme comfort for family road trips.', ARRAY['https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['7-Seater', '4x4', 'Leather Seats', 'Navigation', 'Rear Entertainment'], TRUE, 15000, 4.8),
('Innova Crysta ZX', 'Toyota', 'Innova Crysta', 2020, 'Diesel', 'Automatic', 7, 4799, 'Premium Luxury', 'The gold standard in MPV comfort. Perfect for family tours and corporate travel.', ARRAY['https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['7-Seater', 'Captain Seats', 'Leather Interior', 'Navigation', 'Ambient Lighting'], TRUE, 12000, 4.9),
('BMW 5 Series', 'BMW', '5 Series', 2022, 'Petrol', 'Automatic', 5, 8999, 'Luxury', 'Ultimate luxury sedan. Make a statement wherever you go in Mysore.', ARRAY['https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['Leather Seats', 'Panoramic Roof', 'Harman Kardon', 'Parking Assist', 'Driver Assistance'], TRUE, 25000, 5.0),
('Mercedes C-Class', 'Mercedes-Benz', 'C-Class', 2021, 'Petrol', 'Automatic', 5, 9999, 'Luxury', 'German engineering meets luxury. An unparalleled driving experience awaits.', ARRAY['https://images.pexels.com/photos/3874337/pexels-photo-3874337.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['Burmester Audio', 'Ambient Lighting', 'MBUX System', 'Massaging Seats', 'Night Package'], TRUE, 25000, 5.0),
('Innova Hycross', 'Toyota', 'Innova Hycross', 2024, 'Hybrid', 'Automatic', 7, 7499, 'Premium Luxury', 'The future of MPVs. Strong hybrid for maximum comfort and efficiency.', ARRAY['https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['Strong Hybrid', 'Panoramic Roof', 'Ottoman Seats', 'JBL Audio', 'ADAS'], TRUE, 20000, 4.9),
('Audi A6', 'Audi', 'A6', 2022, 'Petrol', 'Automatic', 5, 11999, 'Luxury', 'Progressive luxury meets quattro performance. Drive the future today.', ARRAY['https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800'], ARRAY['Virtual Cockpit', 'Bang & Olufsen Audio', 'quattro AWD', 'Massage Seats', 'Night Vision'], TRUE, 30000, 5.0);

-- Seed testimonials
INSERT INTO testimonials (name, location, rating, comment, avatar_url, car_rented, is_featured) VALUES
('Rajesh Kumar', 'Bengaluru', 5, 'Absolutely amazing experience! Booked a BMW 5 Series for my anniversary trip to Mysore. The car was immaculate, and the service was top-notch. Classic Car Rental truly lives up to its luxury promise.', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', 'BMW 5 Series', TRUE),
('Priya Sharma', 'Chennai', 5, 'Rented a Creta for a family trip to Coorg. Seamless booking, clean car, and exceptional customer support. Will definitely rent again. Highly recommend to everyone!', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', 'Hyundai Creta', TRUE),
('Arjun Nair', 'Mysore', 5, 'Best car rental in Mysore! The Fortuner was in perfect condition. No hidden charges, transparent pricing. Perfect for our Ooty road trip with family.', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150', 'Toyota Fortuner', TRUE),
('Deepa Menon', 'Kochi', 4, 'Wonderful service! The Innova Crysta was comfortable and well-maintained. The staff was very helpful and cooperative. Great experience overall.', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', 'Innova Crysta', TRUE),
('Suresh Gowda', 'Mysore', 5, 'Rented the Mahindra Thar for a weekend Coorg trip. What an adventure! The car was perfectly maintained. Classic Car Rental made our trip unforgettable!', 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150', 'Mahindra Thar', TRUE),
('Kavitha Reddy', 'Hyderabad', 5, 'Exceptional luxury experience! Booked Mercedes C-Class for our wedding anniversary. Everything was perfect – the car, the service, the whole experience. 10/10!', 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150', 'Mercedes C-Class', TRUE);
