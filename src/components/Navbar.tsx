import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, LayoutDashboard, Shield, Car } from 'lucide-react';
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
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
              style={{ background: '#7B4A1E' }}
            >
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <div
                className="font-montserrat text-sm font-bold leading-none tracking-wide transition-colors duration-300"
                style={{ color: isLight ? '#2A1A0A' : '#D4A44A' }}
              >
                CLASSIC CAR RENTAL
              </div>
              <div
                className="font-poppins text-[10px] tracking-[0.25em] uppercase mt-0.5 transition-colors duration-300"
                style={{ color: isLight ? '#7B4A1E' : '#D4A44A99' }}
              >
                MYSORE
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-7">
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

          {/* Right */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 font-montserrat font-semibold text-xs px-4 py-2.5 rounded-full border transition-all duration-300"
                  style={
                    isLight
                      ? { borderColor: '#7B4A1E', color: '#7B4A1E', background: 'transparent' }
                      : { borderColor: '#D4A44A', color: '#D4A44A', background: 'transparent' }
                  }
                >
                  <User className="w-3.5 h-3.5" />
                  {profile?.name?.split(' ')[0] || 'Account'}
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-52 rounded-xl shadow-lg overflow-hidden border"
                      style={{ background: '#1A1A1A', borderColor: 'rgba(212,164,74,0.2)' }}
                    >
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-gold/10 hover:text-gold transition-colors">
                        <LayoutDashboard className="w-4 h-4" />My Dashboard
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-gold/10 hover:text-gold transition-colors">
                          <Shield className="w-4 h-4" />Admin Panel
                        </Link>
                      )}
                      <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors w-full">
                        <LogOut className="w-4 h-4" />Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/admin-login"
                className="flex items-center gap-2 font-montserrat font-semibold text-xs px-5 py-2.5 rounded-full border transition-all duration-300 hover:opacity-80"
                style={
                  isLight
                    ? { borderColor: '#2A1A0A', color: '#2A1A0A', background: 'transparent' }
                    : { borderColor: '#D4A44A', color: '#D4A44A', background: 'transparent' }
                }
              >
                <Shield className="w-3.5 h-3.5" />
                ADMIN LOGIN
              </Link>
            )}
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
                <Link
                  to="/admin-login"
                  className="font-montserrat font-semibold text-xs px-5 py-3 rounded-full border text-center mt-2"
                  style={{ borderColor: '#7B4A1E', color: '#7B4A1E' }}
                >
                  ADMIN LOGIN
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
