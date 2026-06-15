import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirmPw: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(form.email, form.password, form.name, form.phone);
    setLoading(false);
    if (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } else {
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden bg-hero">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-brown/5 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-brown/3 blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-stone hover:text-brown transition-colors font-poppins text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="luxury-card p-8 relative"
        >
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-brown/40 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-brown/40 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-brown/40 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-brown/40 rounded-br-xl" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-brown-gradient flex items-center justify-center mx-auto mb-4 shadow-brown">
              <Crown className="w-8 h-8 text-cream" />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-earth">Create Account</h1>
            <p className="text-stone font-poppins text-sm mt-1">Join Classic Car Rental Mysore</p>
            <div className="w-12 h-0.5 bg-brown-gradient mx-auto mt-3" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Your full name" required className="input-luxury" />
            </div>
            <div>
              <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+91 9876543210" required className="input-luxury" />
            </div>
            <div>
              <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="your@email.com" required className="input-luxury" />
            </div>
            <div>
              <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => handleChange('password', e.target.value)} placeholder="Min 8 characters" required className="input-luxury pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-brown transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Confirm Password</label>
              <input type="password" value={form.confirmPw} onChange={e => handleChange('confirmPw', e.target.value)} placeholder="Re-enter password" required className="input-luxury" />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-poppins bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </motion.p>
            )}

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full btn-gold justify-center py-4" style={{ borderRadius: '8px' }}>
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />Creating Account...</span>
              ) : (
                <><UserPlus className="w-4 h-4" />Create Account</>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-stone font-poppins text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brown hover:text-brown-dark font-semibold transition-colors">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
