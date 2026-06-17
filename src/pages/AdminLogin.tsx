import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, profile } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError('Invalid credentials. Admin access only.');
      return;
    }
    // profile will update via auth state change
    setTimeout(() => {
      navigate('/admin');
    }, 500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-hero">
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-dark to-earth-dark border-2 border-brown/40 flex items-center justify-center mx-auto mb-4 shadow-brown">
              <Shield className="w-8 h-8 text-brown" />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-earth">Admin Portal</h1>
            <p className="text-stone font-poppins text-sm mt-1">Authorized Personnel Only</p>
            <div className="w-12 h-0.5 bg-brown-gradient mx-auto mt-3" />
          </div>

          <div className="bg-brown/5 border border-brown/20 rounded-xl p-4 mb-6">
            <p className="text-xs font-poppins text-stone text-center">
              This portal is restricted to administrators of Classic Car Rental.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Admin Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@classiccar.rentals" required className="input-luxury" />
            </div>
            <div>
              <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin password" required className="input-luxury pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-brown transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm font-poppins bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </motion.p>
            )}

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full btn-gold justify-center py-4" style={{ borderRadius: '8px' }}>
              {loading ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />Authenticating...</span>
              ) : (
                <><LogIn className="w-4 h-4" />Admin Login</>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-stone hover:text-brown font-poppins text-sm transition-colors">
              User Login instead?
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
