import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Car, Search, CheckCircle } from 'lucide-react';

const vehicleTypes = ['All Vehicles', 'Hatchback', 'Sedan', 'SUV', 'Luxury', 'Premium Luxury'];
const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

const bottomFeatures = [
  { icon: CheckCircle, label: 'Easy Booking' },
  { icon: CheckCircle, label: 'No Hidden Charges' },
  { icon: CheckCircle, label: 'Flexible Cancellation' },
  { icon: CheckCircle, label: 'Clean & Sanitized Cars' },
];

export default function BookingSearch() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    pickupLocation: '',
    pickupDate: today,
    pickupTime: '10:00',
    dropLocation: '',
    dropDate: tomorrow,
    dropTime: '10:00',
    vehicleType: 'All Vehicles',
  });

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSearch() {
    const params = new URLSearchParams({
      category: form.vehicleType === 'All Vehicles' ? '' : form.vehicleType,
      pickupDate: form.pickupDate,
      dropDate: form.dropDate,
      pickupLocation: form.pickupLocation,
      dropLocation: form.dropLocation,
    });
    navigate(`/fleet?${params.toString()}`);
  }

  return (
    <section id="booking" className="relative z-20 -mt-8 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-black-rich/95 backdrop-blur-xl border border-gold/30 rounded-2xl p-8 shadow-luxury"
          style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(212,164,74,0.1)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-playfair text-2xl font-bold text-cream mb-2">
              Find Your Perfect <span className="text-gradient-gold">Luxury Car</span>
            </h2>
            <p className="text-gray-text text-sm font-poppins">Premium self-drive cars available across the city and beyond</p>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Pickup Location */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-montserrat font-semibold text-gold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                Pickup Location
              </label>
              <input
                type="text"
                value={form.pickupLocation}
                onChange={e => handleChange('pickupLocation', e.target.value)}
                placeholder="City, State"
                className="input-luxury"
              />
            </div>

            {/* Pickup Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-montserrat font-semibold text-gold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Pickup Date
              </label>
              <input
                type="date"
                value={form.pickupDate}
                min={today}
                onChange={e => handleChange('pickupDate', e.target.value)}
                className="input-luxury"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Pickup Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-montserrat font-semibold text-gold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Pickup Time
              </label>
              <select
                value={form.pickupTime}
                onChange={e => handleChange('pickupTime', e.target.value)}
                className="input-luxury"
              >
                {timeSlots.map(t => (
                  <option key={t} value={t} style={{ background: '#1A1A1A' }}>{t}</option>
                ))}
              </select>
            </div>

            {/* Drop Location */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-montserrat font-semibold text-gold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                Drop Location
              </label>
              <input
                type="text"
                value={form.dropLocation}
                onChange={e => handleChange('dropLocation', e.target.value)}
                placeholder="Same as Pickup"
                className="input-luxury"
              />
            </div>

            {/* Drop Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-montserrat font-semibold text-gold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Drop Date
              </label>
              <input
                type="date"
                value={form.dropDate}
                min={form.pickupDate}
                onChange={e => handleChange('dropDate', e.target.value)}
                className="input-luxury"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Drop Time */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-montserrat font-semibold text-gold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Drop Time
              </label>
              <select
                value={form.dropTime}
                onChange={e => handleChange('dropTime', e.target.value)}
                className="input-luxury"
              >
                {timeSlots.map(t => (
                  <option key={t} value={t} style={{ background: '#1A1A1A' }}>{t}</option>
                ))}
              </select>
            </div>

            {/* Vehicle Type */}
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <label className="flex items-center gap-2 text-xs font-montserrat font-semibold text-gold uppercase tracking-wider">
                <Car className="w-3.5 h-3.5" />
                Vehicle Type
              </label>
              <select
                value={form.vehicleType}
                onChange={e => handleChange('vehicleType', e.target.value)}
                className="input-luxury"
              >
                {vehicleTypes.map(t => (
                  <option key={t} value={t} style={{ background: '#1A1A1A' }}>{t}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end md:col-span-2 lg:col-span-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="w-full btn-gold text-sm py-3.5 justify-center rounded-lg"
                style={{ borderRadius: '8px', textTransform: 'none', fontSize: '15px', letterSpacing: '0.02em' }}
              >
                <Search className="w-5 h-5" />
                FIND AVAILABLE CARS
              </motion.button>
            </div>
          </div>

          {/* Bottom Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-white/10">
            {bottomFeatures.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-text">
                <Icon className="w-4 h-4 text-gold" />
                <span className="font-poppins">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
