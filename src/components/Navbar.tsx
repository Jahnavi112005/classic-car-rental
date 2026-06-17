import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';
import logoImg from '../assets/classic-car-rental-logo.png';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Our Fleet', href: '/fleet' },
  { label: 'About Us', href: '/#about' },
  { label: 'FAQs', href: '/#faq' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Light theme when: on home page AND not scrolled
  // Dark theme when: scrolled OR not on home page
  const isLight = isHome && !scrolled;

  async function handleSignOut() {
    await signOut();
    setDropdownOpen(false);
    navigate('/');
  }

  function handleNavClick(href: string) {
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
      style={{
        background: isLight
          ? 'rgba(248,243,234,0.97)'
          : 'rgba(13,13,13,0.97)',
        backdropFilter: 'blur(16px)',
        borderBottom: isLight
          ? '1px solid rgba(123,74,30,0.12)'
          : '1px solid rgba(212,164,74,0.15)',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.12)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[64px] lg:h-[80px]">
          {/* Logo + Brand (left) */}
          <Link to="/" className="flex items-center gap-3 z-20" style={{ paddingRight: 6, marginLeft: -34 }}>
            <img
              src={logoImg}
              alt="Classic Car Rentals"
              className="h-[56px] md:h-[72px] lg:h-[84px] w-auto object-contain transform transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] hover:scale-[1.03]"
              style={{ display: 'block', transform: 'translateY(2px)' }}
            />
            <div className="flex flex-col leading-tight">
              <span
                className="font-montserrat"
                style={{ fontWeight: 700, color: isLight ? '#1F1F1F' : '#F6EBD9', letterSpacing: '1px', lineHeight: 1 }}
              >
                CLASSIC CAR RENTALS
              </span>
              <span
                className="font-poppins text-[11px] uppercase"
                style={{ color: isLight ? '#A67C52' : '#D4A44A', letterSpacing: '3px', marginTop: 2 }}
              >
                PREMIUM SELF DRIVE EXPERIENCE
              </span>
            </div>
          </Link>

          {/* Desktop Nav - centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.href.replace('/#', ''));

              return link.href.startsWith('/#') ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="font-poppins text-sm font-medium relative group transition-colors duration-300"
                  style={{ color: isLight ? '#3A2A1A' : '#D0D0D0' }}
                >
                  {link.label}
                  <span
                    className="absolute -bottom-1 left-0 h-0.5 transition-all duration-300"
                    style={{
                      width: isActive ? '100%' : '0',
                      background: '#7B4A1E',
                    }}
                  />
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="font-poppins text-sm font-medium relative group transition-colors duration-300"
                  style={{ color: isLight ? '#3A2A1A' : '#D0D0D0' }}
                >
                  {link.label}
                  <span
                    className="absolute -bottom-1 left-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{
                      width: isActive ? '100%' : '0',
                      background: '#7B4A1E',
                    }}
                  />
                </Link>
              );
            })}
          </div>

          {/* Right - Book Now & Admin Login */}
          <div className="hidden lg:flex items-center gap-4 z-20">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.dispatchEvent(new CustomEvent('openBookingForm'))}
              className="inline-flex items-center justify-center font-montserrat font-semibold text-sm text-white transition-all"
              style={{
                background: '#B67C52',
                borderRadius: '12px',
                height: '48px',
                padding: '12px 22px',
                boxShadow: '0 12px 24px rgba(182,124,82,0.12)',
                transition: 'transform 0.3s ease',
              }}
            >
              Book Now
            </motion.button>
            <Link
              to="/admin-login"
              className="inline-flex items-center justify-center font-montserrat font-semibold text-sm transition-all"
              style={{
                border: '1.5px solid rgba(123,74,30,0.18)',
                color: isLight ? '#2A1A0A' : '#D4A44A',
                borderRadius: '10px',
                height: '44px',
                padding: '10px 18px',
                background: isLight ? 'transparent' : 'rgba(255,255,255,0.04)',
                transition: 'transform 0.3s ease',
              }}
            >
              ADMIN LOGIN
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 transition-colors"
            style={{ color: isLight ? '#7B4A1E' : '#D4A44A' }}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t"
            style={{
              background: isLight ? 'rgba(248,243,234,0.99)' : 'rgba(13,13,13,0.99)',
              borderColor: isLight ? 'rgba(123,74,30,0.15)' : 'rgba(212,164,74,0.1)',
            }}
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map(link =>
                link.href.startsWith('/#') ? (
                  <button
                    key={link.label}
                    onClick={() => { handleNavClick(link.href); setMenuOpen(false); }}
                    className="font-poppins text-sm font-medium text-left py-2 border-b transition-colors"
                    style={{ color: isLight ? '#3A2A1A' : '#D0D0D0', borderColor: 'rgba(123,74,30,0.1)' }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="font-poppins text-sm font-medium py-2 border-b transition-colors"
                    style={{ color: isLight ? '#3A2A1A' : '#D0D0D0', borderColor: 'rgba(123,74,30,0.1)' }}
                  >
                    {link.label}
                  </Link>
                )
              )}
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-gold text-sm justify-center mt-2">
                    <LayoutDashboard className="w-4 h-4" />My Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="text-red-400 text-sm font-montserrat text-center py-2">Sign Out</button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { window.dispatchEvent(new CustomEvent('openBookingForm')); setMenuOpen(false); }}
                    className="w-full bg-[#B67C52] text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-[#9d6a44]"
                  >
                    Book Now
                  </button>
                  <Link
                    to="/admin-login"
                    className="font-montserrat font-semibold text-xs px-5 py-3 rounded-full border text-center mt-2"
                    style={{ borderColor: '#7B4A1E', color: '#7B4A1E' }}
                  >
                    ADMIN LOGIN
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
