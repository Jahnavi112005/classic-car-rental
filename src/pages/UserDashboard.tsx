import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Car, Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  User, Phone, Mail, LogOut, Crown, ArrowRight
} from 'lucide-react';
import { supabase, Booking } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  approved: 'bg-green-500/10 text-green-600 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/30',
  completed: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  cancelled: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
};

const statusIcons: Record<string, any> = {
  pending: AlertCircle,
  approved: CheckCircle,
  rejected: XCircle,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function UserDashboard() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name || '', phone: profile.phone || '' });
    }
  }, [profile]);

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;
      const { data } = await supabase
        .from('bookings')
        .select('*, cars(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setBookings(data || []);
      setLoading(false);
    }
    if (user) fetchBookings();
  }, [user]);

  async function handleCancelBooking(id: string) {
    await supabase.from('bookings').update({ booking_status: 'cancelled' }).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: 'cancelled' } : b));
  }

  async function handleSaveProfile() {
    if (!user) return;
    setSaveLoading(true);
    await supabase.from('profiles').update({ name: profileForm.name, phone: profileForm.phone }).eq('id', user.id);
    setSaveLoading(false);
    setEditProfile(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Car },
    { label: 'Active', value: bookings.filter(b => b.booking_status === 'approved').length, icon: CheckCircle },
    { label: 'Pending', value: bookings.filter(b => b.booking_status === 'pending').length, icon: Clock },
    { label: 'Completed', value: bookings.filter(b => b.booking_status === 'completed').length, icon: Calendar },
  ];

  if (authLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="w-16 h-16 border-4 border-brown/20 border-t-brown rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="bg-hero border-b border-brown/20 px-4 py-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-brown-gradient flex items-center justify-center shadow-brown">
                <Crown className="w-8 h-8 text-cream" />
              </div>
              <div>
                <h1 className="font-playfair text-2xl font-bold text-earth">
                  Welcome, <span className="text-gradient-brown">{profile?.name || 'User'}</span>
                </h1>
                <p className="text-stone font-poppins text-sm">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleSignOut} className="btn-outline-gold text-sm">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card p-5 text-center">
                <Icon className="w-6 h-6 text-brown mx-auto mb-2" />
                <div className="font-playfair text-3xl font-bold text-gradient-brown">{value}</div>
                <div className="text-xs text-stone font-poppins mt-1">{label}</div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-brown/10">
            {(['bookings', 'profile'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`font-montserrat text-sm font-semibold px-6 py-3 capitalize border-b-2 transition-all ${activeTab === tab ? 'border-brown text-brown' : 'border-transparent text-stone hover:text-earth'}`}>
                {tab === 'bookings' ? 'My Bookings' : 'My Profile'}
              </button>
            ))}
          </div>

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="luxury-card h-32 animate-pulse" />)}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20">
                  <Car className="w-16 h-16 text-brown/30 mx-auto mb-4" />
                  <h3 className="font-playfair text-xl font-bold text-earth mb-2">No Bookings Yet</h3>
                  <p className="text-stone font-poppins text-sm mb-6">Start your luxury journey today.</p>
                  <Link to="/fleet" className="btn-gold"><ArrowRight className="w-4 h-4" />Explore Fleet</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, i) => {
                    const StatusIcon = statusIcons[booking.booking_status] || AlertCircle;
                    const car = booking.cars as any;
                    return (
                      <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="luxury-card p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {car?.images?.[0] && (
                            <img src={car.images[0]} alt={car.name} className="w-full md:w-40 h-28 object-cover rounded-xl border border-brown/20 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                              <div>
                                <h3 className="font-playfair text-lg font-bold text-earth">{car?.name || 'Car'}</h3>
                                <p className="text-xs text-stone font-poppins">{car?.brand} - {car?.year}</p>
                              </div>
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-montserrat font-semibold ${statusColors[booking.booking_status]}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                              <div>
                                <span className="text-stone font-poppins text-xs">Pickup</span>
                                <p className="text-earth font-montserrat font-semibold text-xs">{booking.pickup_date}</p>
                              </div>
                              <div>
                                <span className="text-stone font-poppins text-xs">Return</span>
                                <p className="text-earth font-montserrat font-semibold text-xs">{booking.drop_date}</p>
                              </div>
                              <div>
                                <span className="text-stone font-poppins text-xs">Duration</span>
                                <p className="text-earth font-montserrat font-semibold text-xs">{booking.total_days} day{booking.total_days > 1 ? 's' : ''}</p>
                              </div>
                              <div>
                                <span className="text-stone font-poppins text-xs">Total</span>
                                <p className="text-gradient-brown font-playfair font-bold">₹{booking.total_amount.toLocaleString()}</p>
                              </div>
                            </div>
                            {booking.booking_status === 'pending' && (
                              <button onClick={() => handleCancelBooking(booking.id)} className="text-xs text-red-500 hover:text-red-600 font-montserrat font-semibold border border-red-300 px-4 py-2 rounded-full transition-colors">
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-lg">
              <div className="luxury-card p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-playfair text-xl font-bold text-earth">My Profile</h2>
                  <button onClick={() => setEditProfile(!editProfile)} className="btn-outline-gold text-xs" style={{ fontSize: '12px', padding: '8px 16px' }}>
                    {editProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {editProfile ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Full Name</label>
                      <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="input-luxury" />
                    </div>
                    <div>
                      <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">Phone Number</label>
                      <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="input-luxury" />
                    </div>
                    <motion.button onClick={handleSaveProfile} disabled={saveLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full btn-gold justify-center py-3" style={{ borderRadius: '8px' }}>
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {[
                      { icon: User, label: 'Full Name', value: profile?.name || '-' },
                      { icon: Mail, label: 'Email', value: user?.email || '-' },
                      { icon: Phone, label: 'Phone', value: profile?.phone || '-' },
                      { icon: Crown, label: 'Role', value: (profile?.role || 'user').charAt(0).toUpperCase() + (profile?.role || 'user').slice(1) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brown/10 border border-brown/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-brown" />
                        </div>
                        <div>
                          <div className="text-xs text-stone font-poppins mb-1">{label}</div>
                          <div className="text-earth font-poppins font-medium">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
