import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  Car,
  Bell,
  User,
  Phone,
  MessageSquare,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { api, bookingApi, bookingActions, inquiryApi, vehicleApi } from '../services/api';
import { Booking, Car as CarType, Inquiry } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookingDetailsModal from '../components/BookingDetailsModal';
import { whatsAppUrl } from '../utils/whatsapp';
import { getVehicleImagePath } from '../utils/vehicleImage';
import { getAccountDisplayName, getRoleLabel } from '../utils/displayName';
import { useAuth } from '../context/AuthContext';

const statusPill = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

const dashboardSections = [
  { label: 'Dashboard', icon: Home, id: 'dashboard', path: '/booking/dashboard' },
  { label: "Today's Bookings", icon: CalendarDays, id: 'today', path: '/booking/dashboard?view=today' },
  { label: 'Pending Bookings', icon: Clock, id: 'pending', path: '/booking/dashboard?view=pending' },
  { label: 'Verified Bookings', icon: CheckCircle, id: 'approved', path: '/booking/dashboard?view=approved' },
  { label: 'Rejected Bookings', icon: XCircle, id: 'rejected', path: '/booking/dashboard?view=rejected' },
  { label: 'Completed Bookings', icon: Flag, id: 'completed', path: '/booking/dashboard?view=completed' },
  { label: 'Vehicle Availability', icon: Car, id: 'vehicles', path: '/booking/dashboard?view=vehicles' },
  { label: 'Complaints', icon: Bell, id: 'complaints', path: '/booking/dashboard?view=complaints' },
  { label: 'Notifications', icon: MessageSquare, id: 'notifications', path: '/booking/dashboard?view=notifications' },
  { label: 'Profile', icon: User, id: 'profile', path: '/booking/dashboard?view=profile' },
  { label: 'Logout', icon: RefreshCw, id: 'logout', path: '/login' },
];

const vehicleStatuses = ['available', 'booked', 'maintenance'];
const DASHBOARD_CACHE_KEY = 'booking_dashboard_cache_v1';
const DASHBOARD_CACHE_TTL_MS = 60 * 1000;

type DashboardCache = {
  ts: number;
  bookings: Booking[];
  vehicles: CarType[];
  deletedVehicles: CarType[];
};

function readDashboardCache(): DashboardCache | null {
  try {
    const raw = sessionStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DashboardCache;
    if (!parsed || !Array.isArray(parsed.bookings) || !Array.isArray(parsed.vehicles) || !Array.isArray(parsed.deletedVehicles)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeDashboardCache(payload: Omit<DashboardCache, 'ts'>) {
  try {
    sessionStorage.setItem(
      DASHBOARD_CACHE_KEY,
      JSON.stringify({ ...payload, ts: Date.now() } satisfies DashboardCache)
    );
  } catch {
    // Ignore storage failures.
  }
}

export default function BookingDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<CarType[]>([]);
  const [deletedVehicles, setDeletedVehicles] = useState<CarType[]>([]);
  const [fleetStatusChanges, setFleetStatusChanges] = useState<Record<string, string>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [complaints, setComplaints] = useState<Inquiry[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; read: boolean; created_at: string }>>([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [fleetView, setFleetView] = useState<'active' | 'trash'>('active');
  const [confirmAction, setConfirmAction] = useState<null | {
    mode: 'soft' | 'hard';
    vehicleId: string;
    vehicleName: string;
  }>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const cached = readDashboardCache();
    if (cached) {
      setBookings(cached.bookings || []);
      setVehicles((cached.vehicles || []).filter(v => !v.isDeleted));
      setDeletedVehicles((cached.deletedVehicles || []).filter(v => v.isDeleted));
      setFleetStatusChanges((cached.vehicles || []).reduce((acc, vehicle) => ({
        ...acc,
        [String(vehicle.id)]: vehicle.status || 'available',
      }), {}));
      setLoading(false);
    }

    fetchData(!cached, { force: !cached });
    return;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view') || 'dashboard';
    setActiveSection(view);
    if (view === 'pending' || view === 'approved' || view === 'rejected' || view === 'completed') {
      setFilterStatus(view);
    } else {
      setFilterStatus('');
    }
  }, [location.search]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function fetchData(showLoading = true, options?: { force?: boolean }) {
    if (showLoading) setLoading(true);

    const cached = readDashboardCache();
    const isCacheFresh = !!cached && Date.now() - cached.ts < DASHBOARD_CACHE_TTL_MS;
    if (!options?.force && isCacheFresh) {
      setBookings(cached.bookings || []);
      setVehicles((cached.vehicles || []).filter(v => !v.isDeleted));
      setDeletedVehicles((cached.deletedVehicles || []).filter(v => v.isDeleted));
      setFleetStatusChanges((cached.vehicles || []).reduce((acc, vehicle) => ({
        ...acc,
        [String(vehicle.id)]: vehicle.status || 'available',
      }), {}));
      if (showLoading) setLoading(false);
      return;
    }

    try {
      const [bookingList, vehicleList, deletedList] = await Promise.all([
        bookingApi.list(),
        vehicleApi.list(),
        vehicleApi.list({ deletedOnly: 'true' }),
      ]);
      setBookings(bookingList || []);
      const activeVehicles = (vehicleList || []).filter(v => !v.isDeleted);
      setVehicles(activeVehicles);
      setDeletedVehicles((deletedList || []).filter(v => v.isDeleted));
      setFleetStatusChanges(activeVehicles.reduce((acc, vehicle) => ({
        ...acc,
        [String(vehicle.id)]: vehicle.status || 'available',
      }), {}));

      writeDashboardCache({
        bookings: bookingList || [],
        vehicles: activeVehicles,
        deletedVehicles: (deletedList || []).filter(v => v.isDeleted),
      });
      if (selectedVehicle && ![...activeVehicles, ...(deletedList || [])].some(v => String(v.id) === selectedVehicle)) {
        setSelectedVehicle(null);
      }
    } catch (err) {
      console.error('Failed to load booking dashboard data:', err);
      setToast({ type: 'error', message: 'Unable to load dashboard data. Please try again later.' });
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  const counts = useMemo(() => ({
    today: bookings.filter(b => new Date(b.pickup_date).toDateString() === new Date().toDateString()).length,
    pending: bookings.filter(b => b.booking_status === 'pending').length,
    approved: bookings.filter(b => b.booking_status === 'approved').length,
    rejected: bookings.filter(b => b.booking_status === 'rejected').length,
    completed: bookings.filter(b => b.booking_status === 'completed').length,
    available: vehicles.filter(v => v.status === 'available').length,
    booked: vehicles.filter(v => v.status === 'booked').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  }), [bookings, vehicles]);

  const filteredBookings = useMemo(() => {
    const todayFilter = activeSection === 'today';
    const sectionStatus = ['pending', 'approved', 'rejected', 'completed'].includes(activeSection) ? activeSection : '';
    const effectiveStatus = filterStatus || sectionStatus;
    return bookings.filter(booking => {
      if (todayFilter && new Date(booking.created_at).toDateString() !== new Date().toDateString()) return false;
      if (effectiveStatus && booking.booking_status !== effectiveStatus) return false;
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return [booking.bookingId, booking.profiles?.name, booking.customers?.name, booking.pickup_location, booking.drop_location]
        .some(value => value?.toLowerCase().includes(term));
    });
  }, [bookings, filterStatus, search, activeSection]);

  const filteredVehicles = useMemo(() => vehicles, [vehicles]);
  const allVehicles = useMemo(() => [...vehicles, ...deletedVehicles], [vehicles, deletedVehicles]);
  const selectedVehicleData = useMemo(
    () => allVehicles.find(vehicle => String(vehicle.id) === selectedVehicle) || null,
    [allVehicles, selectedVehicle]
  );

  const showBookingSection = ['dashboard', 'today', 'pending', 'approved', 'rejected', 'completed'].includes(activeSection);
  const showVehicleSection = activeSection === 'dashboard' || activeSection === 'vehicles';

  async function updateVehicleStatus(id: string, status: string) {
    setStatusUpdate(prev => ({ ...prev, [id]: 'saving' }));
    try {
      await vehicleApi.update(id, { status, availability: status === 'available' });
      setVehicles(prev => prev.map(vehicle => vehicle.id === id ? { ...vehicle, status, availability: status === 'available' } : vehicle));
    } finally {
      setStatusUpdate(prev => ({ ...prev, [id]: '' }));
    }
  }

  async function handleFleetStatusUpdate(id: string, newStatus: string) {
    const previousStatus = vehicles.find(vehicle => String(vehicle.id) === id)?.status || 'available';
    if (newStatus === previousStatus) return;
    setUpdatingStatus(prev => ({ ...prev, [id]: true }));
    try {
      await vehicleApi.update(id, { status: newStatus as CarType['status'], availability: newStatus === 'available' });
      setVehicles(prev => prev.map(vehicle => String(vehicle.id) === id ? { ...vehicle, status: newStatus as CarType['status'], availability: newStatus === 'available' } : vehicle));
      setToast({ type: 'success', message: 'Fleet status updated successfully.' });
      await fetchData(false, { force: true });
    } catch (err) {
      setFleetStatusChanges(prev => ({ ...prev, [id]: previousStatus }));
      const serverMessage = err?.response?.data?.message || err?.message || 'Unable to update fleet status. Please try again.';
      setToast({ type: 'error', message: serverMessage });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [id]: false }));
    }
  }

  async function softDeleteVehicle(id: string) {
    const vehicleName = allVehicles.find(v => String(v.id) === id)?.name || 'this vehicle';
    setConfirmAction({ mode: 'soft', vehicleId: id, vehicleName });
  }

  async function performSoftDelete(id: string) {
    setUpdatingStatus(prev => ({ ...prev, [id]: true }));
    try {
      await vehicleApi.update(id, { isDeleted: true });
      setToast({ type: 'success', message: 'Vehicle moved to Trash. You can restore it anytime.' });
      await fetchData(false, { force: true });
    } catch (err) {
      setToast({ type: 'error', message: 'Unable to remove vehicle. Please try again.' });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [id]: false }));
    }
  }

  async function restoreVehicle(id: string) {
    setUpdatingStatus(prev => ({ ...prev, [`restore-${id}`]: true }));
    try {
      await vehicleApi.restore(id);
      setToast({ type: 'success', message: 'Vehicle restored to active fleet.' });
      await fetchData(false, { force: true });
    } catch {
      setToast({ type: 'error', message: 'Unable to restore vehicle. Please try again.' });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [`restore-${id}`]: false }));
    }
  }

  async function hardDeleteVehicle(id: string) {
    const vehicleName = allVehicles.find(v => String(v.id) === id)?.name || 'this vehicle';
    setConfirmAction({ mode: 'hard', vehicleId: id, vehicleName });
  }

  async function performHardDelete(id: string) {
    setUpdatingStatus(prev => ({ ...prev, [`hard-${id}`]: true }));
    try {
      await vehicleApi.hardDelete(id);
      setToast({ type: 'success', message: 'Vehicle permanently deleted.' });
      await fetchData(false, { force: true });
    } catch {
      setToast({ type: 'error', message: 'Unable to permanently delete vehicle. Please try again.' });
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [`hard-${id}`]: false }));
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    if (confirmAction.mode === 'soft') {
      await performSoftDelete(confirmAction.vehicleId);
    } else {
      await performHardDelete(confirmAction.vehicleId);
    }
    setConfirmAction(null);
  }

  function normalizePhoneNumber(phone?: string) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10) return `+91${digits}`;
    if (digits.startsWith('91')) return `+${digits}`;
    return `+${digits}`;
  }

  function getPhoneLink(phone?: string) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    return `tel:${digits.length === 10 ? `+91${digits}` : `+${digits}`}`;
  }

  function getWhatsAppLink(phone?: string) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    const normalized = digits.startsWith('91') ? digits : `91${digits}`;
    return `https://wa.me/${normalized}`;
  }

  async function handleBookingAction(id: string, action: 'approve' | 'reject' | 'completed') {
    setLoading(true);
    try {
      if (action === 'approve') await bookingApi.approve(id);
      if (action === 'reject') await bookingApi.reject(id);
      if (action === 'completed') await bookingApi.complete(id);
      setToast({ type: 'success', message: `Booking ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'completed'} successfully.` });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Unable to update booking status.';
      setToast({ type: 'error', message });
    } finally {
      await fetchData(true, { force: true });
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-white">
        <Navbar />
        <div className="pt-24 px-6">
          <div className="rounded-3xl bg-[#111215]/80 border border-white/10 p-10 shadow-2xl backdrop-blur-xl">
            <div className="h-96 animate-pulse bg-[#1A1A1F] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-white">
      <Navbar />
        <BookingDetailsModal id={selectedBookingId} onClose={() => setSelectedBookingId(null)} />
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="rounded-[32px] border border-white/10 bg-[#111315]/80 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <div className="mb-8">
              <div className="text-xs uppercase tracking-[0.3em] text-[#A78B60] mb-3">Operations</div>
              <div className="text-2xl font-semibold text-white">Booking Staff</div>
              <p className="mt-3 text-sm text-[#B8B3A0]">Manage bookings, vehicles and live fleet status.</p>
            </div>
            <nav className="space-y-2">
              {dashboardSections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={async () => {
                      if (section.id === 'logout') {
                        await signOut();
                        navigate(section.path);
                        return;
                      }
                      navigate(section.path);
                    }}
                    className={`w-full flex items-center gap-3 rounded-3xl px-4 py-3 text-left transition ${isActive ? 'bg-[#1F1F23] text-white shadow-[0_12px_30px_-18px_rgba(255,255,255,0.45)]' : 'text-[#B8B3A0] hover:bg-white/5 hover:text-white'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="space-y-8">
            <section className="grid gap-6 lg:grid-cols-3">
              {Object.entries(counts).map(([key, value]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(255,255,255,0.1)]"
                >
                  <div className="text-xs uppercase tracking-[0.3em] text-[#C7B894] mb-4">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="text-4xl font-semibold text-white">{value}</div>
                </motion.div>
              ))}
            </section>

            {showBookingSection && (
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(255,255,255,0.1)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div>
                    <div className="text-sm uppercase tracking-[0.2em] text-[#C7B894] mb-2">Booking Activity</div>
                    <h2 className="text-2xl font-semibold">Real-time booking overview</h2>
                    {activeSection !== 'dashboard' && (
                      <p className="text-sm text-[#B8B3A0] mt-1">Showing {activeSection === 'today' ? "today's" : activeSection} bookings only.</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search bookings..."
                      className="rounded-3xl border border-white/10 bg-[#0F1014] px-4 py-3 text-sm text-white outline-none placeholder:text-[#7A7466]"
                    />
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="rounded-3xl border border-white/10 bg-[#0F1014] px-4 py-3 text-sm text-white outline-none"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Verified</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                    <thead className="border-b border-white/10 text-[#A78B60]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Booking ID</th>
                        <th className="px-4 py-3 font-semibold">Customer</th>
                        <th className="px-4 py-3 font-semibold">Vehicle</th>
                        <th className="px-4 py-3 font-semibold">Pickup</th>
                        <th className="px-4 py-3 font-semibold">Return</th>
                        <th className="px-4 py-3 font-semibold">Verification</th>
                        <th className="px-4 py-3 font-semibold">Payment</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 text-white">{booking.bookingId}</td>
                          <td className="px-4 py-4 text-[#D9D1B1]">{booking.customers?.name || booking.profiles?.name || 'Guest'}</td>
                          <td className="px-4 py-4 text-[#D9D1B1]">{booking.cars?.name || 'TBD'}</td>
                          <td className="px-4 py-4 text-[#D9D1B1]">{booking.pickup_date}</td>
                          <td className="px-4 py-4 text-[#D9D1B1]">{booking.drop_date}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${statusPill[booking.verification_status || 'pending'] || 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                              {booking.verification_status || 'pending'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[#D9D1B1]">{booking.payment_status}</td>
                          <td className="px-4 py-4 space-y-2">
                            <button
                              onClick={() => handleBookingAction(booking.id, 'approve')}
                              className="w-full rounded-2xl bg-[#2C7A59] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1F5E40]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'reject')}
                              className="w-full rounded-2xl bg-[#9F1239] px-3 py-2 text-xs font-semibold text-white hover:bg-[#7B1030]"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'completed')}
                              className="w-full rounded-2xl bg-[#1F2937] px-3 py-2 text-xs font-semibold text-white hover:bg-[#111827]"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => setSelectedBookingId(booking.id)}
                              className="w-full rounded-2xl bg-[#3B82F6] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2563EB]"
                            >
                              View Details
                            </button>
                            <a
                              href={getWhatsAppLink(booking.customers?.whatsapp || booking.customers?.phone || booking.profiles?.phone || '')}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0F1014] px-3 py-2 text-xs font-semibold text-[#D9D1B1] hover:bg-white/5"
                            >
                              <MessageSquare className="w-4 h-4" /> WhatsApp
                            </a>
                            <a
                              href={getPhoneLink(booking.customers?.phone || booking.profiles?.phone || '')}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0F1014] px-3 py-2 text-xs font-semibold text-[#D9D1B1] hover:bg-white/5"
                            >
                              <Phone className="w-4 h-4" /> Call
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {showVehicleSection && (
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(255,255,255,0.1)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <div className="text-sm uppercase tracking-[0.2em] text-[#C7B894] mb-2">Vehicle Availability</div>
                    <h2 className="text-2xl font-semibold">Fleet Management</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex rounded-3xl border border-white/10 bg-[#111315] p-1">
                      <button
                        onClick={() => setFleetView('active')}
                        className={`rounded-3xl px-4 py-2 text-xs font-semibold transition ${fleetView === 'active' ? 'bg-white/10 text-white' : 'text-[#B8B3A0]'}`}
                      >
                        Active ({vehicles.length})
                      </button>
                      <button
                        onClick={() => setFleetView('trash')}
                        className={`rounded-3xl px-4 py-2 text-xs font-semibold transition ${fleetView === 'trash' ? 'bg-white/10 text-white' : 'text-[#B8B3A0]'}`}
                      >
                        Trash ({deletedVehicles.length})
                      </button>
                    </div>
                    <button onClick={() => fetchData(true, { force: true })} className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-[#111315] px-4 py-3 text-sm text-white hover:bg-white/5">
                      <RefreshCw className="w-4 h-4" /> Refresh Fleet
                    </button>
                  </div>
                </div>

                {toast && (
                  <div className={`mb-4 rounded-3xl border px-4 py-3 text-sm ${toast.type === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' : 'border-rose-500 bg-rose-500/10 text-rose-200'}`}>
                    {toast.message}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                    <thead className="border-b border-white/10 text-[#A78B60]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Vehicle</th>
                        <th className="px-4 py-3 font-semibold">Current Status</th>
                        <th className="px-4 py-3 font-semibold">Availability</th>
                        <th className="px-4 py-3 font-semibold">Last Updated</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {(fleetView === 'active' ? filteredVehicles : deletedVehicles).map(vehicle => {
                        const vehicleId = String(vehicle.id);
                        const selectedStatus = fleetStatusChanges[vehicleId] || vehicle.status || 'available';
                        return (
                          <tr key={vehicleId} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-24 overflow-hidden rounded-3xl border border-white/10 bg-[#0F1014]">
                                  <img src={getVehicleImagePath(vehicle)} alt={vehicle.name} className="h-full w-full object-cover" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-white">{vehicle.name}</div>
                                  <div className="text-xs text-[#B8B3A0]">{vehicle.brand} • {vehicle.model}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {fleetView === 'active' ? (
                                <div className="space-y-2">
                                  <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-white/90 border-white/10 bg-[#111315]">
                                    {vehicle.status || 'available'}
                                  </span>
                                  <select
                                    value={selectedStatus}
                                    onChange={e => setFleetStatusChanges(prev => ({ ...prev, [vehicleId]: e.target.value }))}
                                    className="w-full rounded-3xl border border-white/10 bg-[#0F1014] px-3 py-2 text-sm text-white outline-none"
                                  >
                                    {vehicleStatuses.map(status => (
                                      <option key={status} value={status}>{status}</option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-rose-300 border-rose-500/30 bg-rose-500/10">
                                  In Trash
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-[#D9D1B1]">{vehicle.availability ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-4 text-[#D9D1B1]">{vehicle.updated_at ? new Date(vehicle.updated_at).toLocaleString() : 'N/A'}</td>
                            <td className="px-4 py-4 space-y-3">
                              {fleetView === 'active' ? (
                                <button
                                  onClick={() => handleFleetStatusUpdate(vehicleId, selectedStatus)}
                                  disabled={updatingStatus[vehicleId]}
                                  className="w-full rounded-3xl bg-[#1F2937] px-4 py-3 text-xs font-semibold text-white hover:bg-[#111827] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingStatus[vehicleId] ? 'Updating...' : 'Update'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => restoreVehicle(vehicleId)}
                                  disabled={updatingStatus[`restore-${vehicleId}`]}
                                  className="w-full rounded-3xl bg-[#2C7A59] px-4 py-3 text-xs font-semibold text-white hover:bg-[#1F5E40] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingStatus[`restore-${vehicleId}`] ? 'Restoring...' : 'Restore'}
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedVehicle(selectedVehicle === vehicleId ? null : vehicleId)}
                                className="w-full rounded-3xl border border-white/10 bg-[#0F1014] px-4 py-3 text-xs font-semibold text-[#D9D1B1] hover:bg-white/5"
                              >
                                View Details
                              </button>
                              {fleetView === 'active' ? (
                                <button
                                  onClick={() => softDeleteVehicle(vehicleId)}
                                  disabled={updatingStatus[vehicleId]}
                                  className="w-full rounded-3xl bg-[#9F1239] px-4 py-3 text-xs font-semibold text-white hover:bg-[#7B1030] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Move To Trash
                                </button>
                              ) : (
                                <button
                                  onClick={() => hardDeleteVehicle(vehicleId)}
                                  disabled={updatingStatus[`hard-${vehicleId}`]}
                                  className="w-full rounded-3xl bg-[#7B1030] px-4 py-3 text-xs font-semibold text-white hover:bg-[#5E0C25] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingStatus[`hard-${vehicleId}`] ? 'Deleting...' : 'Delete Permanently'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedVehicleData && (
                  <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0F1014] p-6 text-sm text-[#D9D1B1]">
                    <div className="mb-3 text-sm uppercase tracking-[0.2em] text-[#C7B894]">Vehicle Details</div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div><strong>Name:</strong> {selectedVehicleData.name}</div>
                      <div><strong>Category:</strong> {selectedVehicleData.category}</div>
                      <div><strong>Year:</strong> {selectedVehicleData.year}</div>
                      <div><strong>Fuel:</strong> {selectedVehicleData.fuel_type}</div>
                      <div><strong>Transmission:</strong> {selectedVehicleData.transmission}</div>
                      <div><strong>Seats:</strong> {selectedVehicleData.seats}</div>
                      <div className="md:col-span-2"><strong>Description:</strong> {selectedVehicleData.description}</div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeSection === 'complaints' && (
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(255,255,255,0.1)]">
                <div className="mb-6">
                  <div className="text-sm uppercase tracking-[0.2em] text-[#C7B894] mb-2">Complaints</div>
                  <h2 className="text-2xl font-semibold">Customer inquiries & issues</h2>
                </div>
                {complaints.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-[#0F1014] p-8 text-center text-sm text-[#B8B3A0]">No complaints found.</div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map(item => (
                      <div key={item.id} className="rounded-3xl border border-white/10 bg-[#0F1014] p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-sm font-semibold text-white">{item.name || item.email || 'Anonymous'}</div>
                          <div className="text-xs uppercase tracking-[0.2em] text-[#C7B894]">{new Date(item.created_at).toLocaleDateString()}</div>
                        </div>
                        <p className="mt-3 text-sm text-[#D9D1B1]">{item.message || item.note || 'No details provided.'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeSection === 'notifications' && (
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(255,255,255,0.1)]">
                <div className="mb-6">
                  <div className="text-sm uppercase tracking-[0.2em] text-[#C7B894] mb-2">Notifications</div>
                  <h2 className="text-2xl font-semibold">Recent activity</h2>
                </div>
                {notifications.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-[#0F1014] p-8 text-center text-sm text-[#B8B3A0]">No notifications available.</div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map(note => (
                      <div key={note.id} className="rounded-3xl border border-white/10 bg-[#0F1014] p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-white">{note.title}</div>
                            <p className="text-xs text-[#B8B3A0]">{new Date(note.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs ${note.read ? 'bg-slate-800 text-slate-300' : 'bg-amber-100 text-amber-700'}`}>{note.read ? 'Read' : 'New'}</span>
                        </div>
                        <p className="mt-3 text-sm text-[#D9D1B1]">{note.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeSection === 'profile' && (
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_-40px_rgba(255,255,255,0.1)]">
                <div className="mb-6">
                  <div className="text-sm uppercase tracking-[0.2em] text-[#C7B894] mb-2">Profile</div>
                  <h2 className="text-2xl font-semibold">Your account</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-[#0F1014] p-5 text-sm text-[#D9D1B1]">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#C7B894] mb-3">Name</div>
                    <div>{profile ? getAccountDisplayName(profile) : 'N/A'}</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-[#0F1014] p-5 text-sm text-[#D9D1B1]">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#C7B894] mb-3">Email</div>
                    <div>{profile?.email || 'N/A'}</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-[#0F1014] p-5 text-sm text-[#D9D1B1]">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#C7B894] mb-3">Role</div>
                    <div>{profile?.role ? getRoleLabel(profile.role) : 'Booking Staff'}</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-[#0F1014] p-5 text-sm text-[#D9D1B1]">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#C7B894] mb-3">Member since</div>
                    <div>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</div>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0F1014] p-6 text-white shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">
              {confirmAction.mode === 'soft' ? 'Move Vehicle To Trash?' : 'Delete Vehicle Permanently?'}
            </h3>
            <p className="text-sm text-[#B8B3A0] mb-6">
              {confirmAction.mode === 'soft'
                ? `"${confirmAction.vehicleName}" will be moved to Trash and can be restored later.`
                : `"${confirmAction.vehicleName}" will be permanently deleted and cannot be retrieved again.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-[#D9D1B1] hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white ${confirmAction.mode === 'soft' ? 'bg-[#9F1239] hover:bg-[#7B1030]' : 'bg-[#7B1030] hover:bg-[#5E0C25]'}`}
              >
                {confirmAction.mode === 'soft' ? 'Move To Trash' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
