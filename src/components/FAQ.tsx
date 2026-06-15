import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How can I book a car?',
    a: 'You can book a car through our website by browsing the fleet, selecting your preferred vehicle, choosing your pickup and drop dates, and completing the booking form. Alternatively, call us at 9036444477 or message on WhatsApp.',
  },
  {
    q: 'What documents are required for renting?',
    a: 'You need a valid Driving License (minimum 1 year old), Aadhaar Card or any government-issued photo ID, and a security deposit. For outstation trips, additional documents may be required.',
  },
  {
    q: 'Is fuel included in the rental price?',
    a: 'No, fuel is not included in the rental price. You receive the car with a certain fuel level and must return it with the same level. Toll charges, parking fees, and traffic fines are also borne by the customer.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Yes, cancellations are allowed. Cancellations made 24 hours before pickup receive a full refund. Cancellations within 24 hours may incur a 20% cancellation fee. No-shows are non-refundable.',
  },
  {
    q: 'What is the security deposit?',
    a: 'Security deposits vary by vehicle category: ₹3,000–5,000 for hatchbacks, ₹5,000–10,000 for sedans and SUVs, ₹10,000–30,000 for luxury vehicles. The deposit is fully refundable upon safe return of the vehicle.',
  },
  {
    q: 'What is the daily kilometer limit?',
    a: 'The standard limit is 300 km per day. Extra kilometers are charged at ₹10–20 per km depending on the vehicle. Unlimited km packages are available for select vehicles on request.',
  },
  {
    q: 'Can I take the car out of Mysore?',
    a: 'Yes, outstation travel is allowed within Karnataka. For trips to neighboring states (Tamil Nadu, Kerala, Andhra Pradesh), prior written permission and additional documentation may be required. Contact us in advance.',
  },
  {
    q: 'What happens in case of a breakdown?',
    a: 'We provide 24/7 roadside assistance. In case of a breakdown, call our support number immediately. We will arrange either a replacement vehicle or on-site repair at no additional cost to you.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-4 bg-cream">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 border border-brown/30 bg-brown/5 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="w-3.5 h-3.5 text-brown" />
            <span className="font-montserrat text-xs tracking-widest text-brown uppercase">Got Questions?</span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mb-4">
            Frequently Asked <span className="text-gradient-brown">Questions</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-brown to-transparent mx-auto mb-6" />
          <p className="text-stone font-poppins">
            Everything you need to know about our self-drive car rental service.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                open === i ? 'border-brown/50 shadow-brown bg-white' : 'border-brown/20 hover:border-brown/40 bg-white'
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-cream transition-colors"
              >
                <span className={`font-playfair text-lg font-semibold transition-colors ${open === i ? 'text-brown' : 'text-earth'}`}>
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    open === i ? 'border-brown bg-brown/10 text-brown' : 'border-brown/30 text-stone'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 border-t border-brown/10">
                      <div className="w-8 h-0.5 bg-brown-gradient my-4" />
                      <p className="text-earth-light font-poppins leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
