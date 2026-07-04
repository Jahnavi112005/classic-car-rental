import { motion } from 'framer-motion';
import { Shield, Clock, BadgeCheck, Car, Lock, Compass, Sparkles, HeartHandshake } from 'lucide-react';

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified Vehicles',
    description: 'Every car undergoes thorough inspection before each rental. 100% safe and road-worthy.',
  },
  {
    icon: Clock,
    title: '24/7 Assistance',
    description: 'Round-the-clock customer support via call and WhatsApp. We are always here for you.',
  },
  {
    icon: BadgeCheck,
    title: 'Best Price Guarantee',
    description: 'Transparent pricing with no hidden charges. Best rates, guaranteed.',
  },
  {
    icon: Car,
    title: 'Driver Charges Apply',
    description: 'Driver service is available for an additional fee; the base rental covers only the car.',
  },
  {
    icon: Lock,
    title: 'Privacy & Comfort',
    description: 'Your journey, your rules. Complete privacy and personalized comfort throughout.',
  },
  {
    icon: Compass,
    title: 'Flexible Travel',
    description: 'Go wherever you want, whenever you want. Explore freely and beyond.',
  },
  {
    icon: Sparkles,
    title: 'Hygienic & Safe',
    description: 'Deep cleaned and sanitized before every trip. Your health is our priority.',
  },
  {
    icon: HeartHandshake,
    title: 'Roadside Support',
    description: 'Breakdown support and emergency assistance anywhere on your journey.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-cream">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(123,74,30,0.03) 0%, transparent 50%)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 border border-brown/30 bg-brown/5 rounded-full px-4 py-2 mb-6">
            <Shield className="w-3.5 h-3.5 text-brown" />
            <span className="font-montserrat text-xs tracking-widest text-brown uppercase">Why Classic</span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mb-4">
            Why Choose <span className="text-gradient-brown">Us</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-brown to-transparent mx-auto mb-6" />
          <p className="text-stone max-w-lg mx-auto font-poppins">
            We don't just rent cars — we deliver experiences. Here's why thousands trust Classic Car Rental.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -8 }}
                className="luxury-card p-6 group"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-brown/10 border border-brown/20 flex items-center justify-center mb-5 group-hover:bg-brown/20 group-hover:border-brown/40 transition-all duration-300">
                  <Icon className="w-7 h-7 text-brown" />
                </div>

                {/* Brown line */}
                <div className="w-8 h-0.5 bg-brown-gradient mb-4" />

                <h3 className="font-playfair text-lg font-bold text-earth mb-3 group-hover:text-brown transition-colors">
                  {feature.title}
                </h3>
                <p className="text-stone text-sm font-poppins leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
