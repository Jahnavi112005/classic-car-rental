import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Testimonial } from '../lib/supabase';

const fallbackTestimonials: Testimonial[] = [
  { id: '1', name: 'Rajesh Kumar', location: 'Bengaluru', rating: 5, comment: 'Absolutely amazing experience! Booked a BMW 5 Series for my anniversary trip to Mysore. The car was immaculate, and the service was top-notch.', avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', car_rented: 'BMW 5 Series', is_featured: true, created_at: '' },
  { id: '2', name: 'Priya Sharma', location: 'Chennai', rating: 5, comment: 'Rented a Creta for a family trip to Coorg. Seamless booking, clean car, and exceptional customer support. Will definitely rent again!', avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', car_rented: 'Hyundai Creta', is_featured: true, created_at: '' },
  { id: '3', name: 'Arjun Nair', location: 'Mysore', rating: 5, comment: 'Best car rental in Mysore! The Fortuner was in perfect condition. No hidden charges, transparent pricing. Perfect for our Ooty road trip.', avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150', car_rented: 'Toyota Fortuner', is_featured: true, created_at: '' },
  { id: '4', name: 'Deepa Menon', location: 'Kochi', rating: 4, comment: 'Wonderful service! The Innova Crysta was comfortable and well-maintained. The staff was very helpful and cooperative.', avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', car_rented: 'Innova Crysta', is_featured: true, created_at: '' },
  { id: '5', name: 'Suresh Gowda', location: 'Mysore', rating: 5, comment: 'Rented the Mahindra Thar for a weekend Coorg trip. What an adventure! Classic Car Rental made our trip unforgettable!', avatar_url: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150', car_rented: 'Mahindra Thar', is_featured: true, created_at: '' },
  { id: '6', name: 'Kavitha Reddy', location: 'Hyderabad', rating: 5, comment: 'Exceptional luxury experience! Booked Mercedes C-Class for our wedding anniversary. Everything was perfect – 10/10!', avatar_url: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150', car_rented: 'Mercedes C-Class', is_featured: true, created_at: '' },
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await supabase.from('testimonials').select('*').eq('is_featured', true).limit(6);
      if (data && data.length > 0) setTestimonials(data);
    }
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  function prev() {
    setDirection(-1);
    setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length);
  }

  function next() {
    setDirection(1);
    setCurrent(prev => (prev + 1) % testimonials.length);
  }

  const t = testimonials[current];

  return (
    <section id="testimonials" className="py-24 px-4 relative overflow-hidden bg-section">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-brown/5 blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 border border-brown/30 bg-brown/5 rounded-full px-4 py-2 mb-6">
            <Star className="w-3.5 h-3.5 text-brown" />
            <span className="font-montserrat text-xs tracking-widest text-brown uppercase">Customer Reviews</span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mb-4">
            What Our <span className="text-gradient-brown">Customers Say</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-brown to-transparent mx-auto" />
        </motion.div>

        {/* Main Testimonial */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 100 }}
              transition={{ duration: 0.5 }}
              className="luxury-card p-10 md:p-14 text-center relative overflow-hidden"
            >
              {/* Brown corner accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-brown/40 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-brown/40 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-brown/40 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-brown/40 rounded-br-xl" />

              {/* Quote icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brown/10 border border-brown/30 flex items-center justify-center">
                  <Quote className="w-8 h-8 text-brown" />
                </div>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < t.rating ? 'text-brown-light fill-brown-light' : 'text-gray-400'}`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-earth-light text-lg md:text-xl leading-relaxed mb-8 font-poppins italic max-w-3xl mx-auto">
                "{t.comment}"
              </p>

              {/* Divider */}
              <div className="w-16 h-0.5 bg-brown-gradient mx-auto mb-6" />

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <img
                  src={t.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80'}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-brown/40"
                />
                <div className="text-left">
                  <div className="font-playfair font-bold text-earth text-lg">{t.name}</div>
                  <div className="text-xs text-stone font-poppins">{t.location}</div>
                  {t.car_rented && (
                    <div className="text-xs text-brown font-montserrat mt-1">
                      Rented: {t.car_rented}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-brown/40 bg-cream flex items-center justify-center text-brown hover:bg-brown hover:text-cream transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-brown/40 bg-cream flex items-center justify-center text-brown hover:bg-brown hover:text-cream transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`transition-all duration-300 rounded-full ${
                i === current ? 'w-8 h-2 bg-brown' : 'w-2 h-2 bg-brown/30 hover:bg-brown/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
