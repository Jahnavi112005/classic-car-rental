import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import BookingRequestSection from './components/BookingRequestSection';
import FleetPage from './pages/FleetPage';
import CarDetail from './pages/CarDetail';
import BookingPage from './pages/BookingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/fleet" element={<PageWrapper><FleetPage /></PageWrapper>} />
        <Route path="/fleet/:id" element={<PageWrapper><CarDetail /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/admin-login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
        <Route path="/booking" element={<PageWrapper><BookingPage /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><UserDashboard /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminPanel /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
      {/* Global booking modal listener */}
      <BookingRequestSection />
    </AnimatePresence>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="font-playfair text-8xl font-bold text-gradient-gold mb-4">404</div>
        <h1 className="font-playfair text-3xl font-bold text-cream mb-4">Page Not Found</h1>
        <p className="text-gray-text font-poppins mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-gold">
          Return Home
        </a>
      </div>
    </div>
  );
}
