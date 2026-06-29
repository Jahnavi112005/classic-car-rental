import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Zap } from 'lucide-react';
import { whatsAppUrl } from '../utils/whatsapp';

const featured = [
  {
    name: 'BMW 5 Series',
    category: 'Luxury',
    price: 8999,
    rating: 5.0,
    image: 'https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Most Popular',
    specs: ['Petrol', 'Automatic', '5 Seats'],
  },
  {
    name: 'Mercedes C-Class',
    category: 'Luxury',
    price: 9999,
    rating: 5.0,
    image: 'https://images.pexels.com/photos/3874337/pexels-photo-3874337.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Premium Pick',
    specs: ['Petrol', 'Automatic', '5 Seats'],
  },
  {
    name: 'Toyota Fortuner',
    category: 'Premium Luxury',
    price: 4299,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Family Favorite',
    specs: ['Diesel', 'Automatic', '7 Seats'],
  },
  {
    name: 'Mahindra Thar',
    category: 'SUV',
    price: 4999,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/1637859/pexels-photo-1637859.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Adventure King',
    specs: ['Diesel', 'Manual', '4 Seats'],
  },
  {
    name: 'Hyundai Creta',
    category: 'SUV',
    price: 2999,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Best Value',
    specs: ['Petrol', 'Automatic', '5 Seats'],
  },
  {
    name: 'Innova Crysta',
    category: 'Premium Luxury',
    price: 4799,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Top Rated',
    specs: ['Diesel', 'Automatic', '7 Seats'],
  },
];

export default function FeaturedVehicles() {
  return (
    <section className="py-24 px-4 bg-cream-dark overflow-hidden">
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
            <span className="font-montserrat text-xs tracking-widest text-brown uppercase">Featured Vehicles</span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mb-4">
            Our <span className="text-gradient-brown">Flagship</span> Collection
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-brown to-transparent mx-auto mb-6" />
          <p className="text-stone max-w-xl mx-auto font-poppins">
            Hand-picked luxury and premium vehicles — our finest offerings for discerning travelers.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((car, i) => (
            <motion.div
              key={car.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="luxury-card overflow-hidden group relative"
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="font-montserrat text-xs font-bold px-3 py-1.5 bg-brown-gradient text-cream rounded-full shadow-brown">
                  {car.badge}
                </span>
              </div>

              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <motion.img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.6 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth/90 via-earth/20 to-transparent" />

                {/* Category */}
                <div className="absolute bottom-3 left-4">
                  <span className="text-xs font-montserrat font-semibold text-brown-light/80 uppercase tracking-wider">
                    {car.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-earth group-hover:text-brown transition-colors">
                      {car.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-3.5 h-3.5 ${j < Math.floor(car.rating) ? 'text-brown-light fill-brown-light' : 'text-gray-400'}`} />
                      ))}
                      <span className="text-xs text-stone ml-1">{car.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-playfair text-2xl font-bold text-gradient-brown">
                      ₹{car.price.toLocaleString()}
                    </span>
                    <div className="text-xs text-stone">/day</div>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-4 mb-5">
                  {car.specs.map(spec => (
                    <span key={spec} className="text-xs text-stone font-poppins flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-brown/50" />
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Brown divider */}
                <div className="w-full h-px bg-gradient-to-r from-brown/50 via-brown/20 to-transparent mb-5" />

                {/* CTA */}
                <div className="flex items-center gap-2">
                  <Link
                    to="/fleet"
                    className="flex-1 flex items-center justify-between group/link"
                  >
                    <span className="font-montserrat text-xs font-semibold text-brown uppercase tracking-wider">
                      View & Book
                    </span>
                    <div className="w-8 h-8 rounded-full border border-brown/40 flex items-center justify-center group-hover/link:bg-brown group-hover/link:border-brown transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-brown group-hover/link:text-cream transition-colors" />
                    </div>
                  </Link>
                  <a
                    href={whatsAppUrl(car.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: '#25D366' }}
                    title="Book on WhatsApp"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="white"/></svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/fleet" className="btn-gold">
            View Complete Fleet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

