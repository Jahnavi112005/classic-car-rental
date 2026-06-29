import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Fuel, Settings, Users, Star, Search, SlidersHorizontal, X } from 'lucide-react';
import { Car } from '../types';
import { fleetCars } from '../data/fleet';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import BranchPopup from '../components/BranchPopup';
import { whatsAppUrl } from '../utils/whatsapp';

const categories = ['All', 'Hatchback', 'Sedan', 'SUV', 'Luxury', 'Premium Luxury'];
const fuelTypes = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];
const transmissions = ['All', 'Manual', 'Automatic'];

export default function FleetPage() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [filtered, setFiltered] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [fuel, setFuel] = useState('All');
  const [transmission, setTransmission] = useState('All');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [showFilters, setShowFilters] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);

  useEffect(() => {
    setCars(fleetCars);
    setLoading(false);
  }, []);

  useEffect(() => {
    let result = cars;
    if (category !== 'All') result = result.filter(c => c.category === category);
    if (fuel !== 'All') result = result.filter(c => c.fuel_type === fuel);
    if (transmission !== 'All') result = result.filter(c => c.transmission === transmission);
    result = result.filter(c => c.price_per_day <= maxPrice);
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(c =>
        `${c.name} ${c.brand} ${c.model} ${c.yearRange || c.year}`.toLowerCase().includes(term)
      );
    }
    setFiltered(result);
  }, [cars, category, fuel, transmission, maxPrice, search]);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero Banner */}
      <div className="pt-20 pb-10 px-4 bg-hero relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-brown/5 blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <span className="font-montserrat text-xs tracking-widest text-brown uppercase border border-brown/30 bg-brown/5 px-4 py-2 rounded-full">Our Fleet</span>
            <h1 className="font-playfair text-4xl md:text-6xl font-bold text-earth mt-6 mb-4">
              Premium <span className="text-gradient-brown">Fleet</span>
            </h1>
            <p className="text-stone font-poppins max-w-xl mx-auto">
              Choose from our handpicked collection of verified, clean, and luxury vehicles.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, brand, model..."
              className="input-luxury pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg border font-montserrat text-sm font-semibold transition-all ${showFilters ? 'border-brown bg-brown/10 text-brown' : 'border-brown/20 text-stone hover:border-brown/40'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`font-montserrat text-xs font-semibold px-4 py-2 rounded-full border transition-all ${category === cat ? 'bg-brown-gradient text-cream border-transparent' : 'border-brown/30 text-stone hover:border-brown hover:text-brown'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="luxury-card p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div>
                <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-3">Fuel Type</label>
                <div className="flex flex-wrap gap-2">
                  {fuelTypes.map(f => (
                    <button key={f} onClick={() => setFuel(f)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${fuel === f ? 'bg-brown/20 border-brown text-brown' : 'border-brown/20 text-stone hover:border-brown/40'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-3">Transmission</label>
                <div className="flex flex-wrap gap-2">
                  {transmissions.map(t => (
                    <button key={t} onClick={() => setTransmission(t)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${transmission === t ? 'bg-brown/20 border-brown text-brown' : 'border-brown/20 text-stone hover:border-brown/40'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-3">
                  Max Price: ₹{maxPrice.toLocaleString()}/day
                </label>
                <input
                  type="range"
                  min={1000}
                  max={15000}
                  step={500}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brown"
                />
                <div className="flex justify-between text-xs text-stone mt-1">
                  <span>₹1,000</span>
                  <span>₹15,000</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-stone font-poppins text-sm">
            Showing <span className="text-brown font-semibold">{filtered.length}</span> vehicles
          </p>
          {(category !== 'All' || fuel !== 'All' || transmission !== 'All' || search) && (
            <button
              onClick={() => { setCategory('All'); setFuel('All'); setTransmission('All'); setSearch(''); setMaxPrice(15000); }}
              className="flex items-center gap-2 text-xs text-stone hover:text-red-500 transition-colors font-poppins"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Cars Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="luxury-card overflow-hidden animate-pulse">
                <div className="h-48 bg-cream-dark" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-cream-dark rounded w-3/4" />
                  <div className="h-3 bg-cream-dark rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-brown/10 border border-brown/20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-brown/40" />
            </div>
            <h3 className="font-playfair text-2xl font-bold text-earth mb-2">No Cars Found</h3>
            <p className="text-stone font-poppins">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((car, i) => (
              <FleetCarCard key={car.id} car={car} index={i} />
            ))}
          </div>
        )}
      </div>

      <Footer onBranchClick={() => setBranchOpen(true)} />
      <WhatsAppFloat />
      <BranchPopup open={branchOpen} onClose={() => setBranchOpen(false)} />
    </div>
  );
}

function FleetCarCard({ car, index }: { car: Car; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="luxury-card overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={car.images[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600'}
          alt={car.name}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-earth/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 space-y-2">
          <span className="font-montserrat text-xs font-semibold px-3 py-1 bg-brown text-cream rounded-full">{car.category}</span>
          {car.featured && (
            <span className="font-montserrat text-[10px] font-semibold px-2.5 py-1 bg-yellow-500 text-earth rounded-full uppercase tracking-[0.2em]">
              Most Popular
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1.5 bg-cream/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-earth font-poppins">{car.availability ? 'Available' : 'Booked'}</span>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-brown-light fill-brown-light" />
          <span className="text-xs text-cream font-poppins font-semibold">{car.rating}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-playfair text-lg font-bold text-earth mb-1 group-hover:text-brown transition-colors">{car.name}</h3>
        <p className="text-xs text-stone font-poppins mb-4">{car.brand} · {car.yearRange || car.year}</p>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5 text-xs text-stone"><Fuel className="w-3.5 h-3.5 text-brown/60" />{car.fuel_type}</div>
          <div className="flex items-center gap-1.5 text-xs text-stone"><Settings className="w-3.5 h-3.5 text-brown/60" />{car.transmission}</div>
          <div className="flex items-center gap-1.5 text-xs text-stone"><Users className="w-3.5 h-3.5 text-brown/60" />{car.seats}</div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-playfair text-2xl font-bold text-gradient-brown">₹{car.price_per_day.toLocaleString()}</span>
            <span className="text-xs text-stone font-poppins"> /day</span>
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <Link to={`/fleet/${car.id}`} className="flex-1 text-center btn-outline-gold" style={{ fontSize: '11px', padding: '9px 10px' }}>
            Details
          </Link>
          <Link to={`/fleet/${car.id}?book=true`} className="flex-1 text-center btn-gold" style={{ fontSize: '11px', padding: '9px 10px' }}>
            Book Now
          </Link>
        </div>
        <a
          href={whatsAppUrl(car.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 font-montserrat font-semibold text-white py-2.5 rounded-lg transition-all hover:opacity-90"
          style={{ background: '#25D366', fontSize: '11px' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="white"/></svg>
          Book on WhatsApp
        </a>
      </div>
    </motion.div>
  );
}


