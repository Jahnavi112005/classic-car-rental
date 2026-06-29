import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Car, Users, Calendar, DollarSign, CheckCircle, XCircle,
  AlertCircle, Shield, Plus, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { bookingApi, inquiryApi, vehicleApi } from '../services/api';
import AdminBookings from './AdminBookings';
import { Booking, Car as CarType, Inquiry } from '../types';
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

export default function AdminPanel() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'cars' | 'inquiries' | 'bookingManagement'>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<CarType[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    async function fetchData() {
      const [bookingRes, carRes, inquiryRes] = await Promise.all([
        bookingApi.list(),
        vehicleApi.list(),
        inquiryApi.list(),
      ]);
      setBookings(bookingRes || []);
      setCars(carRes || []);
      setInquiries(inquiryRes || []);
      setLoading(false);
    }
    if (user && profile?.role === 'admin') fetchData();
  }, [user, profile]);

  async function updateBookingStatus(id: string, status: string) {
    await bookingApi.update(id, { booking_status: status as Booking['booking_status'] });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, booking_status: status as Booking['booking_status'] } : b));
  }

  async function toggleCarAvailability(id: string, current: boolean) {
    await vehicleApi.update(id, { availability: !current });
    setCars(prev => prev.map(c => c.id === id ? { ...c, availability: !current } : c));
  }

  async function deleteCar(id: string) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    await vehicleApi.remove(id);
    setCars(prev => prev.filter(c => c.id !== id));
  }

  async function markInquiryRead(id: string) {
    await inquiryApi.update(id, { status: 'read' });
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: 'read' } : i));
  }

  const totalRevenue = bookings.filter(b => b.booking_status !== 'rejected' && b.booking_status !== 'cancelled').reduce((sum, b) => sum + b.total_amount, 0);
  const unreadInquiries = inquiries.filter(i => i.status === 'unread').length;

  const overviewStats = [
    { label: 'Total Vehicles', value: cars.length, icon: Car, color: 'text-brown' },
    { label: 'Active Bookings', value: bookings.filter(b => b.booking_status === 'approved').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-blue-600' },
    { label: 'Total Customers', value: new Set(bookings.map(b => b.user_id)).size, icon: Users, color: 'text-purple-600' },
    { label: 'Pending Bookings', value: bookings.filter(b => b.booking_status === 'pending').length, icon: AlertCircle, color: 'text-yellow-600' },
    { label: 'New Inquiries', value: unreadInquiries, icon: Calendar, color: 'text-orange-600' },
  ];

  const canManageBookings = profile?.email === 'booking@classiccarrentals.in' || profile?.email === 'owner@classiccarrentals.in';
  const tabs: Array<{ key: 'overview' | 'bookings' | 'cars' | 'inquiries' | 'bookingManagement'; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'bookings', label: `Bookings (${bookings.length})` },
    { key: 'cars', label: `Fleet (${cars.length})` },
    { key: 'inquiries', label: `Inquiries (${unreadInquiries})` },
  ];
  if (canManageBookings) tabs.push({ key: 'bookingManagement', label: 'Booking Management' });

  if (authLoading || loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="w-16 h-16 border-4 border-brown/20 border-t-brown rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="bg-hero border-b border-brown/20 px-4 py-10">
          <div className="max-w-7xl mx-auto flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-brown-gradient flex items-center justify-center shadow-brown">
              <Shield className="w-7 h-7 text-cream" />
            </div>
            <div>
              <h1 className="font-playfair text-3xl font-bold text-earth">
                Admin <span className="text-gradient-brown">Dashboard</span>
              </h1>
              <p className="text-stone font-poppins text-sm">Classic Car Rental - Control Panel</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-brown/10 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`font-montserrat text-sm font-semibold px-6 py-3 border-b-2 whitespace-nowrap transition-all ${activeTab === tab.key ? 'border-brown text-brown' : 'border-transparent text-stone hover:text-earth'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                {overviewStats.map(({ label, value, icon: Icon, color }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="luxury-card p-5 text-center">
                    <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                    <div className={`font-playfair text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-stone font-poppins mt-1 leading-tight">{label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Bookings */}
              <h2 className="font-playfair text-xl font-bold text-earth mb-4">Recent Bookings</h2>
              <div className="space-y-3">
                {bookings.slice(0, 5).map(booking => {
                  const car = booking.cars;
                  const p = booking.profiles;
                  return (
                    <div key={booking.id} className="luxury-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-earth font-poppins font-semibold text-sm">{car?.name || 'Car'}</p>
                        <p className="text-xs text-stone">{p?.name || 'Customer'} - {booking.pickup_date} to {booking.drop_date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-brown font-playfair font-bold">₹{booking.total_amount.toLocaleString()}</span>
                        <span className={`px-3 py-1 rounded-full border text-xs font-montserrat font-semibold ${statusColors[booking.booking_status]}`}>
                          {booking.booking_status}
                        </span>
                        {booking.booking_status === 'pending' && (
                          <>
                            <button onClick={() => updateBookingStatus(booking.id, 'approved')} className="p-1.5 rounded-full bg-green-100 border border-green-300 text-green-600 hover:bg-green-200 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                            <button onClick={() => updateBookingStatus(booking.id, 'rejected')} className="p-1.5 rounded-full bg-red-100 border border-red-300 text-red-600 hover:bg-red-200 transition-colors"><XCircle className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-3">
              {bookings.map(booking => {
                const car = booking.cars;
                const p = booking.profiles;
                return (
                  <div key={booking.id} className="luxury-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-earth font-poppins font-semibold">{car?.name || 'Car'}</h3>
                        <span className={`px-2.5 py-1 rounded-full border text-xs font-montserrat font-semibold ${statusColors[booking.booking_status]}`}>
                          {booking.booking_status}
                        </span>
                      </div>
                      <p className="text-xs text-stone font-poppins mb-1">Customer: {p?.name || 'Unknown'} - {p?.phone || 'N/A'}</p>
                      <p className="text-xs text-stone font-poppins">
                        {booking.pickup_location} to {booking.drop_location} - {booking.pickup_date} to {booking.drop_date} - {booking.total_days} day{booking.total_days > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-brown font-playfair font-bold text-lg">₹{booking.total_amount.toLocaleString()}</span>
                      {booking.booking_status === 'pending' && (
                        <>
                          <button onClick={() => updateBookingStatus(booking.id, 'approved')} className="btn-gold text-xs py-2 px-4" style={{ fontSize: '11px', borderRadius: '6px' }}>Approve</button>
                          <button onClick={() => updateBookingStatus(booking.id, 'rejected')} className="btn-outline-gold text-xs py-2 px-4" style={{ fontSize: '11px', borderRadius: '6px', color: '#dc2626', borderColor: '#dc2626' }}>Reject</button>
                        </>
                      )}
                      {booking.booking_status === 'approved' && (
                        <button onClick={() => updateBookingStatus(booking.id, 'completed')} className="btn-gold text-xs py-2 px-4" style={{ fontSize: '11px', borderRadius: '6px' }}>Mark Complete</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'bookingManagement' && canManageBookings && (
            <div>
              <AdminBookings />
            </div>
          )}

          {/* Fleet */}
          {activeTab === 'cars' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-playfair text-xl font-bold text-earth">Vehicle Fleet</h2>
                <div className="flex items-center gap-2 bg-brown/10 border border-brown/30 text-brown text-xs font-montserrat font-semibold px-4 py-2 rounded-full">
                  <Plus className="w-3.5 h-3.5" />
                  Contact support to add cars
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cars.map(car => (
                  <div key={car.id} className="luxury-card overflow-hidden">
                    <div className="relative h-40">
                      <img src={car.images[0] || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400'} alt={car.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-earth/70 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="font-montserrat text-xs font-semibold px-2 py-1 bg-brown text-cream rounded-full">{car.category}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-earth font-poppins font-semibold">{car.name}</h3>
                          <p className="text-xs text-stone">{car.brand} - {car.year} - ₹{car.price_per_day.toLocaleString()}/day</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toggleCarAvailability(String(car.id), car.availability)} className={`p-1.5 rounded-full border transition-colors ${car.availability ? 'bg-green-100 border-green-300 text-green-600' : 'bg-red-100 border-red-300 text-red-600'}`} title={car.availability ? 'Mark Unavailable' : 'Mark Available'}>
                            {car.availability ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => deleteCar(String(car.id))} className="p-1.5 rounded-full bg-red-100 border border-red-300 text-red-600 hover:bg-red-200 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className={`text-xs font-montserrat font-semibold px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${car.availability ? 'bg-green-100 border-green-300 text-green-600' : 'bg-red-100 border-red-300 text-red-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-green-500' : 'bg-red-500'}`} />
                        {car.availability ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inquiries */}
          {activeTab === 'inquiries' && (
            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="text-center py-20">
                  <AlertCircle className="w-16 h-16 text-brown/30 mx-auto mb-4" />
                  <h3 className="font-playfair text-xl font-bold text-earth mb-2">No Inquiries</h3>
                  <p className="text-stone font-poppins text-sm">Customer inquiries will appear here.</p>
                </div>
              ) : inquiries.map(inquiry => (
                <div key={inquiry.id} className={`luxury-card p-6 ${inquiry.status === 'unread' ? 'border-brown/40' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-earth font-poppins font-semibold">{inquiry.name}</h3>
                        {inquiry.status === 'unread' && (
                          <span className="px-2 py-0.5 rounded-full bg-brown/20 border border-brown/40 text-brown text-xs font-montserrat font-semibold">New</span>
                        )}
                      </div>
                      <p className="text-xs text-stone font-poppins mb-2">{inquiry.phone} - {inquiry.email}</p>
                      <p className="text-earth-light font-poppins text-sm">{inquiry.message}</p>
                      <p className="text-xs text-stone font-poppins mt-2">{new Date(inquiry.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {inquiry.status === 'unread' && (
                        <button onClick={() => markInquiryRead(inquiry.id)} className="btn-gold text-xs py-2 px-4" style={{ fontSize: '11px', borderRadius: '6px' }}>
                          Mark Read
                        </button>
                      )}
                      <a href={`tel:${inquiry.phone}`} className="btn-outline-gold text-xs py-2 px-4" style={{ fontSize: '11px', borderRadius: '6px' }}>
                        Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}





