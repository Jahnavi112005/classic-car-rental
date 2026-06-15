import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

const destinations = [
  {
    name: 'Mysore Palace',
    description: 'The iconic royal palace – a jewel of Indo-Saracenic architecture.',
    image: 'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'Heritage',
  },
  {
    name: 'Chamundi Hills',
    description: 'Sacred hills with breathtaking panoramic views of Mysore city.',
    image: 'https://images.pexels.com/photos/2372978/pexels-photo-2372978.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'Spiritual',
  },
  {
    name: 'Brindavan Gardens',
    description: 'Terraced gardens with musical fountains illuminated at night.',
    image: 'https://images.pexels.com/photos/1166209/pexels-photo-1166209.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'Gardens',
  },
  {
    name: 'Srirangapatna',
    description: "Tipu Sultan's historic fort island on the Cauvery River.",
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    tag: 'History',
  },
];

export default function AboutMysore() {
  return (
    <section id="about" className="py-24 px-4 bg-section overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 border border-brown/30 bg-brown/5 rounded-full px-4 py-2 mb-6">
              <MapPin className="w-3.5 h-3.5 text-brown" />
              <span className="font-montserrat text-xs tracking-widest text-brown uppercase">Explore Mysore</span>
            </div>

            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mb-6 leading-tight">
              Discover the
              <span className="block text-gradient-brown">City of Palaces</span>
            </h2>

            <div className="w-16 h-0.5 bg-brown-gradient mb-6" />

            <p className="text-earth-light text-lg leading-relaxed mb-6 font-poppins">
              Mysore, the cultural capital of Karnataka, is home to stunning palaces, ancient temples,
              lush gardens and a rich royal heritage. Every corner of this magnificent city tells a story.
            </p>

            <p className="text-stone leading-relaxed mb-8 font-poppins">
              With Classic Car Rental, you have the freedom to explore at your own pace.
              No rush, no schedules — just pure discovery in the comfort of a premium vehicle.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {['Royal Heritage & Architecture', 'Scenic Natural Landscapes', 'Cultural Festivals & Events', 'Premium Silk & Sandalwood Markets'].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brown/20 border border-brown/40 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-brown" />
                  </div>
                  <span className="text-earth-light font-poppins text-sm">{item}</span>
                </div>
              ))}
            </div>

            <Link to="/fleet" className="btn-gold">
              Start Your Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right - Gallery Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className={`relative overflow-hidden rounded-xl group ${i === 0 ? 'col-span-2' : ''}`}
                style={{ height: i === 0 ? '240px' : '180px' }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth/90 via-earth/20 to-transparent" />

                {/* Tag */}
                <div className="absolute top-3 left-3">
                  <span className="font-montserrat text-xs font-semibold px-3 py-1 bg-brown text-cream rounded-full">
                    {dest.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-playfair text-lg font-bold text-cream mb-1">{dest.name}</h3>
                  <p className="text-cream/80 text-xs font-poppins line-clamp-2">{dest.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
