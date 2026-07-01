import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, Crown, Info, Users, type LucideIcon } from 'lucide-react';

const fiveSeaterCars = [
  { model: 'i10 (2015–2019)', price: 1799 },
  { model: 'Celerio (2014–2016)', price: 1899 },
  { model: 'Swift (2008–2011)', price: 1899 },
  { model: 'Amaze (2014–2017)', price: 1999 },
  { model: 'Etios Liva (2012–2016)', price: 1999 },
  { model: 'Swift (2011–2015)', price: 1999 },
  { model: 'Etios (2012–2016)', price: 2199 },
  { model: 'Swift (2015–2017)', price: 2299 },
  { model: 'Baleno (2015–2018)', price: 2399 },
  { model: 'Ciaz (2017–2018)', price: 2399 },
  { model: 'Swift (2018–2023)', price: 2499 },
  { model: 'Honda City (2015–2016)', price: 2499 },
  { model: 'Duster (2014–2019)', price: 2499 },
  { model: 'Verna (2012–2019)', price: 2499 },
  { model: 'i20 (2018–2023)', price: 2699 },
  { model: 'Brezza (2015–2019)', price: 2799 },
  { model: 'Creta (2015–2020)', price: 2999 },
  { model: 'Thar (2022–2023)', price: 4999 },
];

const sevenSeaterCars = [
  { model: 'Innova (2008–2011)', price: 2599 },
  { model: 'Innova (2012–2016)', price: 2999 },
  { model: 'Ertiga (Auto/Manual)', price: 3099 },
  { model: 'XUV 500 W8 (2015–19)', price: 3499 },
  { model: 'XUV 500 W10 (2016–2019)', price: 3999 },
  { model: 'Fortuner (2010–2015)', price: 4299 },
  { model: 'Innova Crysta (2016–2020)', price: 4799 },
  { model: 'Innova Hycross (2020–2026)', price: 7499 },
  { model: 'Fortuner Legender (2021–2023)', price: 11999 },
];

const luxuryCars = [
  { model: 'BMW 5 Series (2022)', price: 8999, deposit: 25000 },
  { model: 'Mercedes C-Class (2021)', price: 9999, deposit: 25000 },
  { model: 'Audi A6 (2022)', price: 11999, deposit: 30000 },
];

const notes = [
  { icon: Info, text: 'Security Deposit Required' },
  { icon: Info, text: 'Valid ID Mandatory' },
  { icon: Info, text: 'Fuel, Toll Extra' },
  { icon: Info, text: '300 KM Limit Per Day' },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 bg-cream-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 border border-brown/30 bg-brown/5 rounded-full px-4 py-2 mb-6">
            <Crown className="w-3.5 h-3.5 text-brown" />
            <span className="font-montserrat text-xs tracking-widest text-brown uppercase">Transparent Pricing</span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mb-4">
            Self Drive <span className="text-gradient-brown">Price List</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-brown to-transparent mx-auto mb-6" />
          <p className="text-stone max-w-lg mx-auto font-poppins">
            Freedom to Drive, Comfort to Enjoy. No hidden charges, no surprises.
          </p>
        </motion.div>

        {/* Pricing Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* 5-Seater */}
          <PricingTable
            title="5-Seater Cars"
            icon={Car}
            cars={fiveSeaterCars}
            delay={0}
            defaultDeposit={5000}
          />

          {/* 7-Seater */}
          <PricingTable
            title="7-Seater Cars"
            icon={Users}
            cars={sevenSeaterCars}
            delay={0.15}
            defaultDeposit={10000}
            highlight
          />

          {/* Luxury */}
          <PricingTable
            title="Luxury Cars"
            icon={Crown}
            cars={luxuryCars}
            delay={0.3}
            defaultDeposit={25000}
            isLuxury
          />
        </div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {notes.map(({ text }) => (
            <div key={text} className="glass-card border border-brown/20 p-4 text-center">
              <p className="text-xs font-montserrat font-semibold text-brown uppercase tracking-wide">{text}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/fleet" className="btn-gold">
            Book Your Car Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function PricingTable({
  title,
  icon: Icon,
  cars,
  delay,
  defaultDeposit,
  highlight = false,
  isLuxury = false,
}: {
  title: string;
  icon: LucideIcon;
  cars: { model: string; price: number; deposit?: number }[];
  delay: number;
  defaultDeposit: number;
  highlight?: boolean;
  isLuxury?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`rounded-2xl overflow-hidden ${highlight ? 'ring-2 ring-brown shadow-brown' : 'border border-brown/20'}`}
    >
      {/* Header */}
      <div className={`p-6 ${highlight ? 'bg-brown-gradient' : 'bg-cream-dark border-b border-brown/20'}`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`w-6 h-6 ${highlight ? 'text-cream' : 'text-brown'}`} />
          <h3 className={`font-playfair text-xl font-bold ${highlight ? 'text-cream' : 'text-earth'}`}>
            {title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className={`text-xs font-montserrat ${highlight ? 'text-cream/70' : 'text-stone'}`}>
            Security Deposit: ₹{defaultDeposit.toLocaleString()}
          </p>
          {isLuxury && (
            <span className="text-[10px] tracking-[0.3em] uppercase text-white bg-brown px-2 py-1 rounded-full">
              Coming Soon
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2 bg-cream-dark border-b border-brown/10">
          <span className="text-xs font-montserrat font-semibold text-brown uppercase tracking-wider">Car Model</span>
          <span className="text-xs font-montserrat font-semibold text-brown uppercase tracking-wider">Price/Day</span>
        </div>
        {cars.map((car, i) => (
          <div
            key={car.model}
            className={`flex items-center justify-between px-4 py-3 border-b border-brown/10 hover:bg-cream transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-cream/50'}`}
          >
            <span className="text-sm text-earth-light font-poppins">{car.model}</span>
            <span className={`font-montserrat font-bold text-sm ${isLuxury ? 'text-gradient-brown' : 'text-brown'}`}>
              ₹{car.price.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

