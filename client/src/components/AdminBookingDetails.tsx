import { useEffect, useState } from 'react';
import { Booking } from '../types';
import { bookingApi, bookingActions, vehicleApi } from '../services/api';
import { Car } from '../types';

type Props = { id: string | null; onClose: () => void };

export default function AdminBookingDetails({ id, onClose }: Props) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notes, setNotes] = useState('');
  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [audit, setAudit] = useState<Array<{ id: string; admin?: { id?: string; name?: string; email?: string }; action: string; detail?: Record<string, unknown>; ts: string }>>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await bookingApi.get(id as string);
      setBooking(data || null);
      // load vehicles
      const v = await vehicleApi.list();
      setVehicles((v || []).filter((x: Car) => x.availability));
      // load audit logs
      try {
        const a = await bookingActions.audit(id as string);
        setAudit(a || []);
      } catch {
        setAudit([]);
      }
    })();
  }, [id]);

  if (!id) return null;
  if (!booking) return <div className="p-6">Loading...</div>;

  const doc = booking.documents?.[0];
  const customer = booking.customers || { name: booking.profiles?.name || '', phone: booking.profiles?.phone || '', email: booking.profiles?.email || '' };

  function compareField(customerVal?: string, ocrVal?: string) {
    const a = (customerVal || '').trim();
    const b = (ocrVal || '').trim();
    if (!a && !b) return { result: 'missing' };
    if (a.toLowerCase() === b.toLowerCase()) return { result: 'match' };
    if (a && b && (a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase()))) return { result: 'partial' };
    return { result: 'mismatch' };
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="bg-white w-[min(95vw,900px)] rounded-2xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Booking {booking.bookingId || booking.id}</h3>
            <div className="text-xs text-stone">{booking.pickup_date} → {booking.drop_date}</div>
          </div>
          <button onClick={onClose} className="text-stone px-4">Close</button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold mb-2">Booking Details</div>
            <div className="text-xs text-stone space-y-1">
              <div><strong>Booking ID:</strong> {booking.bookingId}</div>
              <div><strong>Customer ID:</strong> {booking.customers?.customerId || ''}</div>
              <div><strong>Name:</strong> {customer.name}</div>
              <div><strong>Mobile:</strong> {customer.phone}</div>
              <div><strong>Email:</strong> {customer.email}</div>
              <div><strong>Pickup:</strong> {booking.pickup_location} {booking.pickup_time}</div>
              <div><strong>Drop:</strong> {booking.drop_location} {booking.drop_time}</div>
              <div><strong>Vehicle:</strong> {booking.cars?.name || booking.car_id}</div>
              <div><strong>Booking Status:</strong> {booking.booking_status}</div>
              <div><strong>Verification:</strong> {booking.verification_status}</div>
              <div><strong>Payment:</strong> {booking.payment_status}</div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold mb-2">Vehicle Assignment</div>
              <div className="flex gap-2">
                <select className="input-luxury" id="assign-vehicle">
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v._id || v.id}>{v.name} — {v.model}</option>)}
                </select>
                <button className="btn-gold" onClick={async () => {
                  const sel = (document.getElementById('assign-vehicle') as HTMLSelectElement).value;
                  if (!sel) return;
                  await bookingActions.assign(id as string, sel);
                  const updated = await bookingApi.get(id as string);
                  setBooking(updated);
                }}>Assign</button>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold mb-2">Admin Notes</div>
              <textarea className="input-luxury h-24" value={notes} onChange={e => setNotes(e.target.value)} />
              <div className="flex gap-2 mt-2">
                <button className="btn-gold" onClick={async () => {
                  if (!notes.trim()) return;
                  const updated = await bookingActions.addNote(id as string, notes.trim());
                  setBooking(updated);
                  setNotes('');
                }}>Add Note</button>
                <button className="btn-outline-gold" onClick={async () => {
                  const status = prompt('Set status (pending, verified, confirmed, assigned, completed, cancelled, rejected):', booking.booking_status || 'pending');
                  if (!status) return;
                  const updated = await bookingActions.changeStatus(id as string, status);
                  setBooking(updated);
                }}>Change Status</button>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">Document Preview</div>
            {doc ? (
              <div>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer"><img src={doc.fileUrl} alt="doc" className="w-full h-52 object-contain" /></a>
              </div>
            ) : (
              <div className="text-xs text-stone">No document uploaded</div>
            )}

            <div className="text-sm font-semibold mt-4 mb-2">OCR Extracted Data</div>
            <div className="text-xs bg-gray-50 p-3 rounded h-40 overflow-auto">{JSON.stringify(doc?.ocr || {}, null, 2)}</div>

            <div className="text-sm font-semibold mt-4 mb-2">OCR Comparison</div>
            <div className="space-y-2 text-xs">
              {['name', 'dob', 'address', 'document_number'].map(k => {
                const custRec = customer as Record<string, string>;
                const custVal = custRec[k] || '';
                const ocrRec = (doc?.ocr || {}) as Record<string, unknown>;
                const ocrVal = String(ocrRec[k] || '');
                const cmp = compareField(custVal, ocrVal);
                const confidence = typeof ocrRec['confidence'] === 'number' ? (ocrRec['confidence'] as number) : 0;
                return (
                  <div key={k} className="flex justify-between items-start gap-4">
                    <div className="w-1/3"><strong>{k}</strong><div className="text-stone">Customer: {custVal}</div></div>
                    <div className="w-1/3"><div className="text-stone">OCR: {ocrVal}</div><div className="text-xs text-stone">Confidence: {Math.round(confidence * 100)}%</div></div>
                    <div className="w-1/3">{cmp.result === 'match' ? '✔ Match' : cmp.result === 'partial' ? '➖ Partial' : cmp.result === 'mismatch' ? '❌ Mismatch' : '—'}</div>
                  </div>
                );
              })}
            </div>

            <div className="text-sm font-semibold mt-4 mb-2">Timeline</div>
            <div className="text-xs bg-gray-50 p-3 rounded h-40 overflow-auto">
              {(booking.timeline || []).map((t, i) => (
                <div key={i} className="mb-2">{new Date(t.ts).toLocaleString()} — {t.event} {t.meta?.note ? `: ${t.meta.note}` : ''}</div>
              ))}
            </div>

            <div className="text-sm font-semibold mt-4 mb-2">Audit Log</div>
            <div className="text-xs bg-gray-50 p-3 rounded h-40 overflow-auto">
              {audit.map(a => (
                <div key={a.id} className="mb-2">{new Date(a.ts).toLocaleString()} — {a.admin?.name || 'Admin'} — {a.action}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
