import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setMessage('Reset link sent. Check your email.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to send reset email.';
      setError(message.includes('not authorized') ? 'This email is not authorized.' : message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-hero">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-brown/5 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-brown/3 blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-stone hover:text-brown transition-colors font-poppins text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="luxury-card p-8 relative">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-brown-gradient flex items-center justify-center mx-auto mb-4 shadow-brown">
              <Mail className="w-8 h-8 text-cream" />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-earth">Forgot Password</h1>
            <p className="text-stone font-poppins text-sm mt-1">Enter your Booking Staff email to receive a reset link.</p>
            <div className="w-12 h-0.5 bg-brown-gradient mx-auto mt-3" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Booking Staff Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="booking@classiccarrentals.in"
                required
                className="input-luxury"
              />
            </div>

            {error && <p className="text-red-500 text-sm font-poppins bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}
            {message && <p className="text-green-600 text-sm font-poppins bg-green-50 border border-green-200 rounded-lg px-4 py-3">{message}</p>}

            <button type="submit" disabled={loading} className="w-full btn-gold justify-center py-4" style={{ borderRadius: '8px' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
