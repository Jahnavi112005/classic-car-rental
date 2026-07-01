import { useEffect, useState } from 'react';
import { bookingApi, bookingActions } from '../services/api';
import { Booking } from '../types';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import AdminBookingDetails from '../components/AdminBookingDetails';

const statuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'assigned'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  useEffect(() => {
    (async () => {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (verificationFilter) params.verification = verificationFilter;
      if (q) params.q = q;
      const data = await bookingApi.list(params);
      setBookings(data || []);
      setLoading(false);
    })();
  }, [q, statusFilter, verificationFilter]);

  async function handleAction(id: string, action: string) {
    await bookingActions.action(id, { action });
    const data = await bookingApi.list();
    setBookings(data || []);
  }

  function openDetails(id: string) {
    setSelected(id);
  }

  function closeDetails() {
    setSelected(null);
  }

  async function handleExport() {
    try {
      const blob = await bookingActions.exportCSV({ status: statusFilter });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bookings.csv';
      a.click();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="p-6">Loading bookings...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="luxury-card p-4">Pending: {bookings.filter(b => b.booking_status === 'pending').length}</div>
        <div className="luxury-card p-4">Verified Today: {bookings.filter(b => b.verification_status === 'verified').length}</div>
        <div className="luxury-card p-4">Rejected: {bookings.filter(b => b.booking_status === 'rejected').length}</div>
        <div className="luxury-card p-4">Completed: {bookings.filter(b => b.booking_status === 'completed').length}</div>
      </div>

      <div className="flex gap-3 items-center">
        <input placeholder="Search by booking id, customer, phone" value={q} onChange={e => setQ(e.target.value)} className="input-luxury" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-luxury">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={verificationFilter} onChange={e => setVerificationFilter(e.target.value)} className="input-luxury">
          <option value="">All Verification</option>
          <option value="pending">pending</option>
          <option value="partial">partial</option>
          <option value="verified">verified</option>
        </select>
        <button onClick={handleExport} className="btn-outline-gold">Export CSV</button>
      </div>

      {bookings.map(b => (
        <div key={b.id} className="luxury-card p-4 flex justify-between items-center">
          <div>
            <div className="font-semibold text-earth">{b.bookingId || b.id} — {b.profiles?.name || b.customers?.name || 'Customer'}</div>
            <div className="text-xs text-stone">{b.pickup_date} → {b.drop_date} • {b.cars?.name || 'Vehicle'}</div>
            <div className="text-xs text-stone">Verification: {b.verification_status}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleAction(b.id, 'approve')} className="btn-gold text-xs py-2 px-3"><CheckCircle className="w-4 h-4" /> Approve</button>
            <button onClick={() => handleAction(b.id, 'reject')} className="btn-outline-gold text-xs py-2 px-3"><XCircle className="w-4 h-4" /> Reject</button>
            <button onClick={() => openDetails(b.id)} className="btn-outline-gold text-xs py-2 px-3"><FileText className="w-4 h-4" /> Details</button>
          </div>
        </div>
      ))}
      {selected && <AdminBookingDetails id={selected} onClose={closeDetails} />}
    </div>
  );
}
