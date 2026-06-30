import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Fuel, Settings, Users, Star, ArrowRight, Zap } from 'lucide-react';
import { Car } from '../types';
import { fleetCars } from '../data/fleet';
import VehicleImage from '../components/VehicleImage';
import { whatsAppUrl } from '../utils/whatsapp';

const categories = ['All', 'Hatchback', 'Sedan', 'SUV', 'Premium Luxury'];

export default function Fleet() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filtered, setFiltered] = useState<Car[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const availableCars = fleetCars.filter(c => c.availability).slice(0, 8);
    setCars(availableCars);
    setFiltered(availableCars);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFiltered(cars);
    } else {
      setFiltered(cars.filter(c => c.category === activeCategory));
    }
  }, [activeCategory, cars]);

  return (
    <section id="fleet" className="py-24 px-4 bg-section">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 border border-brown/30 bg-brown/5 rounded-full px-4 py-2 mb-6">
            <Zap className="w-3.5 h-3.5 text-brown" />
            <span className="font-montserrat text-xs tracking-widest text-brown uppercase">Our Premium Fleet</span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mb-4">
            Explore Our <span className="text-gradient-brown">Premium Fleet</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-brown to-transparent mx-auto mb-6" />
          <p className="text-stone max-w-xl mx-auto font-poppins">
            From compact city cars to ultra-luxury sedans — find the perfect car for your Mysore adventure.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-montserrat text-xs font-semibold px-5 py-2.5 rounded-full border transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-brown-gradient text-cream border-transparent'
                  : 'border-brown/30 text-stone hover:border-brown hover:text-brown'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="luxury-card overflow-hidden animate-pulse">
                <div className="h-48 bg-cream-dark" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-cream-dark rounded w-3/4" />
                  <div className="h-3 bg-cream-dark rounded w-1/2" />
                  <div className="h-8 bg-cream-dark rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filtered.map((car, i) => (
                <CarCard key={car.id} car={car} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/fleet" className="btn-outline-gold">
            View Complete Fleet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function CarCard({ car, index }: { car: Car; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="luxury-card overflow-hidden group cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <VehicleImage
          vehicle={car}
          alt={car.name}
          wrapperClassName="w-full h-full"
          imgClassName="w-full h-full object-contain"
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3 space-y-2">
          <span className="font-montserrat text-xs font-semibold px-3 py-1 bg-brown text-cream rounded-full">
            {car.category}
          </span>
          {car.featured && (
            <span className="font-montserrat text-[10px] font-semibold px-2.5 py-1 bg-yellow-500 text-earth rounded-full uppercase tracking-[0.2em]">
              Most Popular
            </span>
          )}
        </div>

        {/* Availability */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1.5 bg-cream/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-earth font-poppins">
              {car.availability ? 'Available' : 'Booked'}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-brown-light fill-brown-light" />
          <span className="text-xs text-cream font-poppins font-semibold">{car.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-playfair text-lg font-bold text-earth mb-1 group-hover:text-brown transition-colors">
          {car.name}
        </h3>
        <p className="text-xs text-stone font-poppins mb-4">{car.brand} · {car.yearRange || car.year}</p>

        {/* Specs */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5 text-xs text-stone">
            <Fuel className="w-3.5 h-3.5 text-brown/60" />
            <span>{car.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone">
            <Settings className="w-3.5 h-3.5 text-brown/60" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone">
            <Users className="w-3.5 h-3.5 text-brown/60" />
            <span>{car.seats} Seats</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-playfair text-2xl font-bold text-gradient-brown">
              ₹{car.price_per_day.toLocaleString()}
            </span>
            <span className="text-xs text-stone font-poppins"> /day</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mb-2">
          <Link
            to={`/fleet/${car.id}`}
            className="flex-1 text-center btn-outline-gold"
            style={{ fontSize: '11px', padding: '9px 10px' }}
          >
            Details
          </Link>
          <Link
            to={`/fleet/${car.id}?book=true`}
            className="flex-1 text-center btn-gold"
            style={{ fontSize: '11px', padding: '9px 10px' }}
          >
            Book Now
          </Link>
        </div>
        {/* WhatsApp */}
        <a
          href={whatsAppUrl(car.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 font-montserrat font-semibold text-white py-2.5 rounded-lg transition-all hover:opacity-90"
          style={{ background: '#25D366', fontSize: '11px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="white"/></svg>
          Book on WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

