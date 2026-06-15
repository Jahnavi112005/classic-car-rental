import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Car, BadgeCheck, Clock, Search, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroIllustration from '../assets/hero-illustration.png';

const features = [
  { icon: Shield, label: '100% Safe &', sub: 'Insured' },
  { icon: Car, label: 'Wide Range', sub: 'of Cars' },
  { icon: BadgeCheck, label: 'Best Price', sub: 'Guarantee' },
  { icon: Clock, label: '24/7 Customer', sub: 'Support' },
];

export default function Hero() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 16);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  const [pickupDT, setPickupDT] = useState(today);
  const [dropDT, setDropDT] = useState(tomorrow);

  function handleSearch() {
    const pickupDate = pickupDT.split('T')[0];
    const dropDate = dropDT.split('T')[0];
    navigate(`/fleet?pickupDate=${pickupDate}&dropDate=${dropDate}`);
  }

  function scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F8F3EA 0%, #F5EFE6 50%, #F0E8DC 100%)',
        backgroundImage: `url(${heroIllustration})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center right',
        backgroundSize: 'cover',
      }}
    >
      {/* Decorative botanical left */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 pointer-events-none select-none overflow-hidden">
        <BotanicalLeft />
      </div>
      {/* Decorative botanical right */}
      <div className="absolute right-0 top-0 w-20 md:w-28 pointer-events-none select-none overflow-hidden">
        <BotanicalRight />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 pt-28 pb-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-4 items-center min-h-[620px]">
          {/* Left Content */}
          <div className="pr-0 lg:pr-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
              style={{ background: 'rgba(42,35,28,0.88)', border: '1px solid rgba(42,35,28,0.2)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L8.5 5.5H13L9.5 8.5L11 13L7 10L3 13L4.5 8.5L1 5.5H5.5L7 1Z" fill="#D4A44A" />
              </svg>
              <span className="font-montserrat text-[11px] font-semibold tracking-[0.2em] text-amber-100 uppercase">
                Premium Self Drive Experience
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="font-playfair leading-tight mb-3">
                <span
                  className="block text-4xl md:text-6xl lg:text-[72px] font-bold"
                  style={{ color: '#1A1209' }}
                >
                  Drive Your Journey.
                </span>
                <span className="block text-4xl md:text-6xl lg:text-[72px] font-bold">
                  <span style={{ color: '#7B4A1E' }}>Discover</span>
                  <span style={{ color: '#7B4A1E' }}> Mysore</span>
                  <span style={{ color: '#1A1209' }}> &amp; Beyond.</span>
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-poppins text-base leading-relaxed mb-7"
              style={{ color: '#5C4A35', maxWidth: '420px' }}
            >
              Premium self-drive cars for every occasion. Comfort, safety, and
              freedom – all in your hands.
            </motion.p>

            {/* Feature Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              {features.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 w-24">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                    style={{ borderColor: '#7B4A1E', background: 'rgba(123,74,30,0.08)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#7B4A1E' }} />
                  </div>
                  <div className="text-center">
                    <div
                      className="font-poppins text-[11px] font-semibold leading-tight"
                      style={{ color: '#2A1A0A' }}
                    >
                      {label}
                    </div>
                    <div
                      className="font-poppins text-[11px] leading-tight"
                      style={{ color: '#5C4A35' }}
                    >
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/fleet"
                className="inline-flex items-center gap-2 font-montserrat font-semibold text-[13px] tracking-wide px-6 py-3.5 text-white transition-all duration-300 hover:shadow-lg hover:opacity-90"
                style={{ background: '#7B4A1E', borderRadius: '4px', letterSpacing: '0.06em' }}
              >
                EXPLORE OUR FLEET
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={scrollToContact}
                className="inline-flex items-center gap-2 font-montserrat font-semibold text-[13px] tracking-wide px-6 py-3.5 transition-all duration-300 hover:bg-amber-900/10"
                style={{
                  border: '1.5px solid #7B4A1E',
                  color: '#7B4A1E',
                  borderRadius: '4px',
                  letterSpacing: '0.06em',
                  background: 'transparent',
                }}
              >
                CONTACT AGENT
              </button>
            </motion.div>
          </div>

          {/* Right - Palace + Car + Flowers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:flex items-end justify-center"
            style={{ minHeight: '460px' }}
          />
        </div>
      </div>

      {/* Booking Bar */}
      <div className="relative z-20 px-4 sm:px-8 pb-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#FFFFFF',
              boxShadow: '0 8px 40px rgba(123,74,30,0.15), 0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid rgba(123,74,30,0.1)',
            }}
          >
            <div className="flex flex-col md:flex-row items-stretch">
              {/* Pickup */}
              <div className="flex-1 p-5 border-b md:border-b-0 md:border-r" style={{ borderColor: 'rgba(123,74,30,0.12)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" style={{ color: '#7B4A1E' }} />
                  <span
                    className="font-montserrat font-semibold text-xs uppercase tracking-widest"
                    style={{ color: '#7B4A1E' }}
                  >
                    Pickup Date &amp; Time
                  </span>
                </div>
                <input
                  type="datetime-local"
                  value={pickupDT}
                  onChange={e => setPickupDT(e.target.value)}
                  className="w-full font-poppins text-sm outline-none bg-transparent"
                  style={{ color: '#2A1A0A', colorScheme: 'light' }}
                />
              </div>

              {/* Dropoff */}
              <div className="flex-1 p-5 border-b md:border-b-0 md:border-r" style={{ borderColor: 'rgba(123,74,30,0.12)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" style={{ color: '#7B4A1E' }} />
                  <span
                    className="font-montserrat font-semibold text-xs uppercase tracking-widest"
                    style={{ color: '#7B4A1E' }}
                  >
                    Dropoff Date &amp; Time
                  </span>
                </div>
                <input
                  type="datetime-local"
                  value={dropDT}
                  onChange={e => setDropDT(e.target.value)}
                  className="w-full font-poppins text-sm outline-none bg-transparent"
                  style={{ color: '#2A1A0A', colorScheme: 'light' }}
                />
              </div>

              {/* Button */}
              <div className="p-4 flex items-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSearch}
                  className="w-full md:w-auto flex items-center justify-center gap-2 font-montserrat font-bold text-sm text-white px-6 py-3.5 transition-all duration-300"
                  style={{ background: '#7B4A1E', borderRadius: '8px', minWidth: '200px', letterSpacing: '0.04em' }}
                >
                  <Search className="w-4 h-4" />
                  FIND AVAILABLE CARS
                </motion.button>
              </div>
            </div>

            {/* Bottom Features */}
            <div
              className="flex flex-wrap items-center justify-center gap-6 px-6 py-3 border-t"
              style={{ borderColor: 'rgba(123,74,30,0.10)', background: 'rgba(123,74,30,0.03)' }}
            >
              {['Easy Booking', 'No Hidden Charges', 'Clean & Sanitized Cars', 'Flexible Cancellation'].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6.5" stroke="#7B4A1E" strokeWidth="1" />
                    <path d="M4 7L6 9L10 5" stroke="#7B4A1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-poppins text-xs" style={{ color: '#5C4A35' }}>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── SVG Illustrations ─────────────────────────────────────────────── */

function MysoorePalaceSVG() {
  return (
    <svg
      viewBox="0 0 520 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-25"
      style={{ maxHeight: '380px' }}
    >
      {/* Main central dome */}
      <ellipse cx="260" cy="80" rx="32" ry="28" stroke="#7B4A1E" strokeWidth="1.5" />
      <path d="M228 80 Q260 40 292 80" stroke="#7B4A1E" strokeWidth="1.5" fill="none" />
      <line x1="260" y1="52" x2="260" y2="40" stroke="#7B4A1E" strokeWidth="1.5" />
      <circle cx="260" cy="38" r="4" stroke="#7B4A1E" strokeWidth="1.2" />

      {/* Side domes */}
      <ellipse cx="180" cy="110" rx="22" ry="18" stroke="#7B4A1E" strokeWidth="1.2" />
      <path d="M158 110 Q180 78 202 110" stroke="#7B4A1E" strokeWidth="1.2" fill="none" />
      <line x1="180" y1="88" x2="180" y2="76" stroke="#7B4A1E" strokeWidth="1.2" />
      <circle cx="180" cy="74" r="3" stroke="#7B4A1E" strokeWidth="1" />

      <ellipse cx="340" cy="110" rx="22" ry="18" stroke="#7B4A1E" strokeWidth="1.2" />
      <path d="M318 110 Q340 78 362 110" stroke="#7B4A1E" strokeWidth="1.2" fill="none" />
      <line x1="340" y1="88" x2="340" y2="76" stroke="#7B4A1E" strokeWidth="1.2" />
      <circle cx="340" cy="74" r="3" stroke="#7B4A1E" strokeWidth="1" />

      {/* Smaller domes */}
      <ellipse cx="130" cy="135" rx="16" ry="13" stroke="#7B4A1E" strokeWidth="1" />
      <path d="M114 135 Q130 110 146 135" stroke="#7B4A1E" strokeWidth="1" fill="none" />
      <line x1="130" y1="118" x2="130" y2="109" stroke="#7B4A1E" strokeWidth="1" />
      <circle cx="130" cy="107" r="2.5" stroke="#7B4A1E" strokeWidth="0.8" />

      <ellipse cx="390" cy="135" rx="16" ry="13" stroke="#7B4A1E" strokeWidth="1" />
      <path d="M374 135 Q390 110 406 135" stroke="#7B4A1E" strokeWidth="1" fill="none" />
      <line x1="390" y1="118" x2="390" y2="109" stroke="#7B4A1E" strokeWidth="1" />
      <circle cx="390" cy="107" r="2.5" stroke="#7B4A1E" strokeWidth="0.8" />

      {/* Main building body */}
      <rect x="100" y="148" width="320" height="160" rx="2" stroke="#7B4A1E" strokeWidth="1.2" fill="none" />

      {/* Arched entrance */}
      <path d="M220 308 L220 240 Q260 210 300 240 L300 308" stroke="#7B4A1E" strokeWidth="1.2" fill="none" />

      {/* Windows - arched */}
      {[130, 175, 345, 390].map(x => (
        <g key={x}>
          <path d={`M${x - 18} 308 L${x - 18} 250 Q${x} 228 ${x + 18} 250 L${x + 18} 308`} stroke="#7B4A1E" strokeWidth="1" fill="none" />
        </g>
      ))}

      {/* Ground level columns */}
      {[120, 155, 195, 325, 365, 400].map(x => (
        <line key={x} x1={x} y1="148" x2={x} y2="308" stroke="#7B4A1E" strokeWidth="0.7" strokeDasharray="2,4" />
      ))}

      {/* Ground line */}
      <line x1="60" y1="308" x2="460" y2="308" stroke="#7B4A1E" strokeWidth="1" />

      {/* Side wings */}
      <rect x="50" y="180" width="52" height="128" rx="2" stroke="#7B4A1E" strokeWidth="1" fill="none" />
      <rect x="418" y="180" width="52" height="128" rx="2" stroke="#7B4A1E" strokeWidth="1" fill="none" />

      {/* Wing arches */}
      <path d="M58 308 L58 250 Q76 228 94 250 L94 308" stroke="#7B4A1E" strokeWidth="0.8" fill="none" />
      <path d="M426 308 L426 250 Q444 228 462 250 L462 308" stroke="#7B4A1E" strokeWidth="0.8" fill="none" />

      {/* Decorative horizontal band */}
      <line x1="100" y1="200" x2="420" y2="200" stroke="#7B4A1E" strokeWidth="0.8" strokeDasharray="3,4" />
      <line x1="100" y1="220" x2="420" y2="220" stroke="#7B4A1E" strokeWidth="0.5" strokeDasharray="2,5" />

      {/* Stars/lights */}
      {[140, 200, 260, 320, 380].map(x => (
        <circle key={x} cx={x} cy="164" r="3" stroke="#D4A44A" strokeWidth="1" fill="#D4A44A" opacity="0.6" />
      ))}
    </svg>
  );
}

function FloralLeft() {
  return (
    <svg width="100" height="180" viewBox="0 0 100 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 180 Q30 140 10 100 Q30 90 50 120 Q60 80 80 60 Q60 100 50 130" stroke="#7B4A1E" strokeWidth="1" fill="none" opacity="0.4" />
      {[80, 100, 120, 140].map((y, i) => (
        <g key={y} opacity="0.5">
          <circle cx={20 + i * 5} cy={y} r="5" fill="none" stroke="#D4A44A" strokeWidth="1" />
          <circle cx={20 + i * 5} cy={y} r="2" fill="#D4A44A" opacity="0.4" />
        </g>
      ))}
      {[60, 90, 110].map((y, i) => (
        <g key={y} opacity="0.4">
          <circle cx={40 + i * 8} cy={y} r="6" fill="none" stroke="#8B5E3C" strokeWidth="1" />
          <circle cx={40 + i * 8} cy={y} r="2.5" fill="#8B5E3C" opacity="0.3" />
        </g>
      ))}
      <path d="M50 180 Q35 150 20 120" stroke="#7B4A1E" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M50 180 Q65 160 75 135" stroke="#7B4A1E" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

function FloralRight() {
  return (
    <svg width="120" height="200" viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M70 0 Q90 40 110 90 Q90 100 70 70 Q60 110 40 130 Q60 90 70 60" stroke="#7B4A1E" strokeWidth="1" fill="none" opacity="0.4" />
      {[30, 55, 75, 95].map((y, i) => (
        <g key={y} opacity="0.5">
          <circle cx={90 - i * 5} cy={y} r="5" fill="none" stroke="#D4A44A" strokeWidth="1" />
          <circle cx={90 - i * 5} cy={y} r="2" fill="#D4A44A" opacity="0.4" />
        </g>
      ))}
      {[20, 50, 80].map((y, i) => (
        <g key={y} opacity="0.4">
          <circle cx={50 - i * 6} cy={y} r="7" fill="none" stroke="#8B5E3C" strokeWidth="1" />
          <circle cx={50 - i * 6} cy={y} r="3" fill="#8B5E3C" opacity="0.3" />
        </g>
      ))}
      <path d="M70 0 Q80 40 95 70" stroke="#7B4A1E" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M70 0 Q50 30 40 60" stroke="#7B4A1E" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

function BotanicalLeft() {
  return (
    <svg width="120" height="100%" viewBox="0 0 120 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <path d="M60 800 Q20 700 10 600 Q50 580 70 640 Q80 560 100 500 Q70 560 60 620" stroke="#7B4A1E" strokeWidth="1.2" fill="none" opacity="0.25" />
      <path d="M60 800 Q80 680 90 560" stroke="#8B5E3C" strokeWidth="1" fill="none" opacity="0.2" strokeLinecap="round" />
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} opacity="0.3">
          <circle cx={30 + (i % 3) * 20} cy={100 + i * 55} r="6" fill="none" stroke="#8B5E3C" strokeWidth="1" />
          <circle cx={30 + (i % 3) * 20} cy={100 + i * 55} r="2.5" fill="#D4A44A" opacity="0.5" />
        </g>
      ))}
      <path d="M20 200 Q40 180 55 200 Q40 215 20 200Z" fill="#7B4A1E" opacity="0.15" />
      <path d="M15 350 Q35 325 55 345 Q35 368 15 350Z" fill="#7B4A1E" opacity="0.15" />
      <path d="M25 500 Q48 475 65 498 Q45 520 25 500Z" fill="#7B4A1E" opacity="0.15" />
      <path d="M10 650 Q35 625 55 648 Q32 672 10 650Z" fill="#7B4A1E" opacity="0.15" />
    </svg>
  );
}

function BotanicalRight() {
  return (
    <svg width="120" height="100%" viewBox="0 0 120 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 0 Q100 80 110 160 Q70 180 50 120 Q40 180 20 220 Q50 175 60 130" stroke="#7B4A1E" strokeWidth="1.2" fill="none" opacity="0.25" />
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i} opacity="0.3">
          <circle cx={90 - (i % 2) * 20} cy={30 + i * 55} r="6" fill="none" stroke="#8B5E3C" strokeWidth="1" />
          <circle cx={90 - (i % 2) * 20} cy={30 + i * 55} r="2.5" fill="#D4A44A" opacity="0.5" />
        </g>
      ))}
      <path d="M110 80 Q88 60 70 80 Q88 98 110 80Z" fill="#7B4A1E" opacity="0.15" />
      <path d="M100 200 Q76 178 58 198 Q78 218 100 200Z" fill="#7B4A1E" opacity="0.15" />
    </svg>
  );
}
