import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { inquiryApi } from '../services/api';

const vehicles = [
  'i10 Sportz', 'Grand i10', 'Swift ZXI', 'Honda City ZX', 'Verna SX', 'Creta SX',
  'Mahindra Thar LX', 'Toyota Fortuner', 'Innova Crysta ZX', 'BMW 5 Series',
  'Mercedes C-Class', 'Innova Hycross', 'Audi A6', 'Other',
];

type InquiryModalProps = {
  open: boolean;
  onClose: () => void;
  preselectedVehicle?: string;
};

export default function InquiryModal({ open, onClose, preselectedVehicle }: InquiryModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_interested: preselectedVehicle || '',
    pickup_date: today,
    drop_date: tomorrow,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      setError('Please fill in name, phone and email.');
      return;
    }
    setError('');
    setLoading(true);
    let err: unknown = null;
    try {
      await inquiryApi.create({
      name: form.name,
      phone: form.phone,
      email: form.email,
      message: form.message || `Interested in: ${form.vehicle_interested}`,
      vehicle_interested: form.vehicle_interested,
      pickup_date: form.pickup_date || null,
      drop_date: form.drop_date || null,
      status: 'unread',
      });
    } catch (error) {
      err = error;
    }
    setLoading(false);
    if (err) {
      setError('Failed to submit. Please try again or call us directly.');
    } else {
      setSuccess(true);

      try {
        const isComplaint = /complaint|complain|issue|problem|refund/i.test(String(form.message || ''));
        if (isComplaint) {
          const subject = encodeURIComponent('Customer Support / Complaint - Classic Car Rentals');
          const body = encodeURIComponent([
            `Name: ${form.name}`,
            `Phone: ${form.phone}`,
            `Email: ${form.email}`,
            `Vehicle: ${form.vehicle_interested || 'Not specified'}`,
            `Pickup: ${form.pickup_date || 'N/A'}`,
            `Drop: ${form.drop_date || 'N/A'}`,
            '',
            `Message:\n${form.message || ''}`,
          ].join('\n'));

          // Open user's mail client with prefilled complaint details
          window.open(`mailto:owner@classiccarrentals.in?subject=${subject}&body=${body}`);
        }
      } catch (e) {
        // noop - don't block success flow if mailto fails
      }
    }
  }

  function handleClose() {
    setSuccess(false);
    setError('');
    setForm({ name: '', phone: '', email: '', vehicle_interested: preselectedVehicle || '', pickup_date: today, drop_date: tomorrow, message: '' });
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-earth/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-luxury z-10"
            style={{ background: '#FFFFFF', border: '1px solid rgba(123,74,30,0.2)' }}
          >
            {/* Brown top bar */}
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #7B4A1E, #5C3715)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(123,74,30,0.1)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brown/10 border border-brown/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-brown" />
                </div>
                <div>
                  <h2 className="font-playfair text-lg font-bold text-earth">Send an Inquiry</h2>
                  <p className="text-xs text-stone font-poppins">We'll respond within 30 minutes</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full border border-brown/20 flex items-center justify-center text-stone hover:text-earth hover:border-brown/40 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto bg-cream-light">
              {success ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green-100 border border-green-300 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-earth mb-2">Inquiry Submitted!</h3>
                  <p className="text-stone font-poppins text-sm mb-6">
                    Thank you! Our team will contact you within 30 minutes.
                  </p>
                  <a
                    href={`https://wa.me/919036444477?text=${encodeURIComponent(`Hello Classic Car Rentals,\n\nI just submitted an inquiry.\nName: ${form.name}\nVehicle: ${form.vehicle_interested}\nPickup: ${form.pickup_date}\nDrop: ${form.drop_date}\n\nPlease confirm.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-montserrat font-bold text-sm text-white px-6 py-3 rounded-xl"
                    style={{ background: '#25D366' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="white"/></svg>
                    Also Chat on WhatsApp
                  </a>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-1.5">Name *</label>
                      <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Your full name" required className="input-luxury text-sm py-2.5" />
                    </div>
                    <div>
                      <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-1.5">Mobile *</label>
                      <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+91 9876543210" required className="input-luxury text-sm py-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="your@email.com" required className="input-luxury text-sm py-2.5" />
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-1.5">Vehicle Interested In</label>
                    <select value={form.vehicle_interested} onChange={e => handleChange('vehicle_interested', e.target.value)} className="input-luxury text-sm py-2.5">
                      <option value="">Select a vehicle...</option>
                      {vehicles.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-1.5">Pickup Date</label>
                      <input type="date" value={form.pickup_date} min={today} onChange={e => handleChange('pickup_date', e.target.value)} className="input-luxury text-sm py-2.5" />
                    </div>
                    <div>
                      <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-1.5">Drop Date</label>
                      <input type="date" value={form.drop_date} min={form.pickup_date} onChange={e => handleChange('drop_date', e.target.value)} className="input-luxury text-sm py-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-1.5">Message</label>
                    <textarea value={form.message} onChange={e => handleChange('message', e.target.value)} placeholder="Any specific requirements or questions..." rows={3} className="input-luxury text-sm resize-none" />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-poppins bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 btn-gold justify-center py-3"
                      style={{ borderRadius: '10px' }}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />Submitting...</span>
                      ) : (
                        <><Send className="w-4 h-4" />Submit Inquiry</>
                      )}
                    </motion.button>
                    <a
                      href={`https://wa.me/919036444477?text=${encodeURIComponent(`Hello Classic Car Rentals,\n\nI would like to book a vehicle.\nVehicle: ${form.vehicle_interested || 'Not selected'}\nPickup Date: ${form.pickup_date}\nDrop Date: ${form.drop_date}\n\nPlease share availability and pricing.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-montserrat font-semibold text-xs text-white px-4 py-3 rounded-xl transition-all hover:opacity-90"
                      style={{ background: '#25D366' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="white"/></svg>
                      WhatsApp
                    </a>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

