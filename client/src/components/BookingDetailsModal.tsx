import { useEffect, useState } from 'react';
import { X, Phone, MessageSquare } from 'lucide-react';
import { Booking } from '../types';
import { bookingApi, bookingActions } from '../services/api';

type Props = { id: string | null; onClose: () => void };

export default function BookingDetailsModal({ id, onClose }: Props) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    (async () => {
      try {
        const data = await bookingApi.get(id as string);
        setBooking(data || null);
      } catch (err) {
        console.error('Failed to load booking details:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id) return null;
  if (loading) return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50"><div className="bg-white p-8 rounded-2xl">Loading...</div></div>;
  if (!booking) return null;

  const doc = booking.documents?.[0];
  const customer = booking.customers || { name: booking.profiles?.name || '', phone: booking.profiles?.phone || '', email: booking.profiles?.email || '' };

  function normalizePhone(phone?: string) {
    if (!phone) return '';
    const digits = String(phone).replace(/\\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.startsWith('91')) return `+${digits}`;
    return `+${digits}`;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="bg-white w-[min(95vw,1000px)] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-[#F8F3EA] to-white">
          <div>
            <h3 className="font-playfair font-bold text-2xl text-earth">Booking {booking.bookingId || booking.id}</h3>
            <div className="text-sm text-stone mt-1">{booking.pickup_date} → {booking.drop_date}</div>
          </div>
          <button onClick={onClose} className="text-stone hover:text-earth transition-colors p-2">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Customer Details */}
              <div>
                <h4 className="font-semibold text-earth text-lg mb-4">Customer Details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-stone">Full Name:</span>
                    <div className="text-earth">{customer.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Email:</span>
                    <div className="text-earth">{customer.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Phone Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-earth">{customer.phone || 'N/A'}</span>
                      {customer.phone && (
                        <a href={`tel:${customer.phone}`} className="text-blue-600 hover:text-blue-800">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">WhatsApp Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-earth">{customer.whatsapp || customer.phone || 'N/A'}</span>
                      {(customer.whatsapp || customer.phone) && (
                        <a href={`https://wa.me/${normalizePhone(customer.whatsapp || customer.phone)}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Address:</span>
                    <div className="text-earth">{customer.address || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h4 className="font-semibold text-earth text-lg mb-4">Booking Details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-stone">Booking ID:</span>
                    <div className="text-earth font-mono">{booking.bookingId || booking.id}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Booking Status:</span>
                    <div className="capitalize text-earth font-semibold">{booking.booking_status || 'Pending'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Verification Status:</span>
                    <div className="capitalize text-earth font-semibold">{booking.verification_status || 'Pending'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Payment Status:</span>
                    <div className="capitalize text-earth font-semibold">{booking.payment_status || 'Pending'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Booking Date:</span>
                    <div className="text-earth">{new Date(booking.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Vehicle Details */}
              <div>
                <h4 className="font-semibold text-earth text-lg mb-4">Vehicle Details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-stone">Vehicle Name:</span>
                    <div className="text-earth">{booking.cars?.name || 'TBD'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Pickup Date & Time:</span>
                    <div className="text-earth">{booking.pickup_date} at {booking.pickup_time || '10:00'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Return Date & Time:</span>
                    <div className="text-earth">{booking.drop_date} at {booking.drop_time || '10:00'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Pickup Location:</span>
                    <div className="text-earth">{booking.pickup_location || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-stone">Drop Location:</span>
                    <div className="text-earth">{booking.drop_location || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Government Document */}
              <div>
                <h4 className="font-semibold text-earth text-lg mb-4">Government Document</h4>
                {doc ? (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-48">
                      <img src={doc.fileUrl} alt="doc" className="w-full h-full object-contain" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-stone">Document Type:</span>
                        <div className="text-earth capitalize">{booking.documentType || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="font-semibold text-stone">Document Number:</span>
                        <div className="text-earth font-mono">{booking.documentNumber || 'N/A'}</div>
                      </div>
                    </div>
                    <a href={doc.fileUrl} download={doc.originalName || 'document'} className="block text-center bg-earth text-white px-4 py-2 rounded-lg hover:bg-[#7B4A1E] transition-colors text-sm font-semibold">
                      Download Document
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-stone font-semibold">Government ID Not Uploaded</p>
                    <p className="text-xs text-stone mt-1">No document was provided for this booking.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {(booking.timeline && booking.timeline.length > 0) && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="font-semibold text-earth text-lg mb-4">Activity Timeline</h4>
              <div className="space-y-2 text-sm">
                {booking.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-l-2 border-earth/20 pl-4">
                    <div className="text-stone">{new Date(t.ts).toLocaleString()}</div>
                    <div className="text-earth font-semibold capitalize">{(t.event || '').replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
