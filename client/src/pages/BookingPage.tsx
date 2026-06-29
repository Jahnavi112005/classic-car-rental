import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, FileText, Car } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { documentApi, bookingApi } from '../services/api';
import { Booking } from '../types';

const vehicleOptions = [
  'All Vehicles',
  'Hatchback',
  'Sedan',
  'SUV',
  'Luxury',
  'Premium Luxury',
  '7-Seater',
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

type BookingForm = {
  fullName: string;
  mobileNumber: string;
  email: string;
  whatsappNumber: string;
  vehicleSelection: string;
  pickupDate: string;
  pickupTime?: string;
  returnDate: string;
  returnTime?: string;
  pickupLocation: string;
  dropLocation?: string;
  notes?: string;
  governmentId: File | null;
  governmentIdType: 'driving_license' | 'aadhaar' | 'passport' | '';
};

const initialForm: BookingForm = {
  fullName: '',
  mobileNumber: '',
  email: '',
  whatsappNumber: '',
  vehicleSelection: 'All Vehicles',
  pickupDate: today,
  returnDate: tomorrow,
  pickupLocation: '',
  governmentId: null,
  governmentIdType: '',
};

export default function BookingPage() {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  function handleChange(field: keyof BookingForm, value: string | File | null) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.mobileNumber.trim()) nextErrors.mobileNumber = 'Mobile number is required.';
    if (!form.email?.trim()) nextErrors.email = 'Email is required.';
    if (!form.whatsappNumber.trim()) nextErrors.whatsappNumber = 'WhatsApp number is required.';
    if (!form.vehicleSelection.trim()) nextErrors.vehicleSelection = 'Vehicle selection is required.';
    if (!form.pickupDate.trim()) nextErrors.pickupDate = 'Pickup date is required.';
    if (!form.returnDate.trim()) nextErrors.returnDate = 'Return date is required.';
    if (!form.pickupLocation.trim()) nextErrors.pickupLocation = 'Pickup location is required.';
    if (!form.governmentId) nextErrors.governmentId = 'Upload a government ID.';
    if (!form.governmentIdType) nextErrors.governmentIdType = 'Select document type.';
    if (form.returnDate && form.pickupDate && form.returnDate < form.pickupDate) {
      nextErrors.returnDate = 'Return date must be after pickup date.';
    }

    return nextErrors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccess('');
      return;
    }
    (async () => {
      try {
        // upload document first
        const fd = new FormData();
        fd.append('file', form.governmentId as Blob);
        fd.append('type', form.governmentIdType || 'other');
        const doc = await documentApi.upload(fd);

        // create booking payload
        type CustomerPayload = { name: string; email?: string; phone?: string; address?: string };
        const payload: Partial<Booking> & { customer?: CustomerPayload } = {
          pickup_location: form.pickupLocation,
          drop_location: form.dropLocation || '',
          pickup_date: form.pickupDate,
          drop_date: form.returnDate,
          pickup_time: form.pickupTime || '10:00',
          drop_time: form.returnTime || '10:00',
          notes: form.notes || '',
          car_id: form.vehicleSelection,
          total_days: 1,
          total_amount: 0,
          document: doc._id || doc.id || null,
          customer: {
            name: form.fullName,
            email: form.email,
            phone: form.mobileNumber,
          },
        };

        // try guest create first; if user logged in, server will handle accordingly
        await bookingApi.createGuest(payload);
        setSuccess('Booking request submitted successfully. We will contact you shortly.');
        setErrors({});
        setForm(initialForm);
        setTimeout(() => setSuccess(''), 6000);
      } catch (err: unknown) {
        setSuccess('');
        const message = err instanceof Error ? err.message : String(err);
        setErrors({ form: message || 'Failed to create booking' });
      }
    })();
  }

  return (
    <div className="min-h-screen bg-[#F8F3EA] text-[#2A1A0A]">
      <Navbar />

      <main className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
            <div className="max-w-3xl">
              <p className="text-xs font-montserrat uppercase tracking-[0.35em] text-[#7B4A1E] mb-3">
                Booking Request
              </p>
              <h1 className="font-playfair text-4xl md:text-5xl font-bold leading-tight text-earth">
                Reserve your luxury ride with ease.
              </h1>
              <p className="mt-4 text-stone font-poppins text-base max-w-2xl leading-relaxed">
                Fill out your details and our team will help finalize the perfect car for your journey.
                Enjoy premium service, seamless booking, and attentive support from Classic Car Rental.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-[#B67C52] bg-white px-5 py-3 text-sm font-semibold text-[#7B4A1E] shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
            <section className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="luxury-card p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#B67C52] text-white grid place-items-center shadow-xl">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-playfair text-2xl font-bold text-earth">Book Your Ride</h2>
                    <p className="text-sm text-stone font-poppins">Premium booking form with brown luxury styling.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">Full Name</label>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={e => handleChange('fullName', e.target.value)}
                        placeholder="Your full name"
                        className="input-luxury mt-2"
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-2">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">Mobile Number</label>
                      <input
                        type="tel"
                        value={form.mobileNumber}
                        onChange={e => handleChange('mobileNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="input-luxury mt-2"
                      />
                      {errors.mobileNumber && <p className="text-red-500 text-xs mt-2">{errors.mobileNumber}</p>}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">WhatsApp Number</label>
                      <input
                        type="tel"
                        value={form.whatsappNumber}
                        onChange={e => handleChange('whatsappNumber', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="input-luxury mt-2"
                      />
                      {errors.whatsappNumber && <p className="text-red-500 text-xs mt-2">{errors.whatsappNumber}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">Vehicle Selection</label>
                      <select
                        value={form.vehicleSelection}
                        onChange={e => handleChange('vehicleSelection', e.target.value)}
                        className="input-luxury mt-2"
                      >
                        {vehicleOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      {errors.vehicleSelection && <p className="text-red-500 text-xs mt-2">{errors.vehicleSelection}</p>}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">Pickup Date</label>
                      <input
                        type="date"
                        value={form.pickupDate}
                        onChange={e => handleChange('pickupDate', e.target.value)}
                        className="input-luxury mt-2"
                      />
                      {errors.pickupDate && <p className="text-red-500 text-xs mt-2">{errors.pickupDate}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">Return Date</label>
                      <input
                        type="date"
                        value={form.returnDate}
                        min={form.pickupDate}
                        onChange={e => handleChange('returnDate', e.target.value)}
                        className="input-luxury mt-2"
                      />
                      {errors.returnDate && <p className="text-red-500 text-xs mt-2">{errors.returnDate}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-earth font-montserrat">Pickup Location</label>
                    <input
                      type="text"
                      value={form.pickupLocation}
                      onChange={e => handleChange('pickupLocation', e.target.value)}
                      placeholder="City, airport, or hotel address"
                      className="input-luxury mt-2"
                    />
                    {errors.pickupLocation && <p className="text-red-500 text-xs mt-2">{errors.pickupLocation}</p>}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className="input-luxury mt-2"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">Return Time</label>
                      <input type="time" value={form.returnTime || ''} onChange={e => handleChange('returnTime', e.target.value)} className="input-luxury mt-2" />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">Pickup Time</label>
                      <input type="time" value={form.pickupTime || ''} onChange={e => handleChange('pickupTime', e.target.value)} className="input-luxury mt-2" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-earth font-montserrat">Drop Location</label>
                      <input type="text" value={form.dropLocation || ''} onChange={e => handleChange('dropLocation', e.target.value)} placeholder="Drop off address" className="input-luxury mt-2" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-earth font-montserrat">Government ID</label>
                    <div className="mt-2 flex items-center gap-3">
                      <select value={form.governmentIdType} onChange={e => handleChange('governmentIdType', e.target.value)} className="input-luxury">
                        <option value="">Select document type</option>
                        <option value="driving_license">Driving License</option>
                        <option value="aadhaar">Aadhaar Card</option>
                        <option value="passport">Passport</option>
                      </select>
                      <label className="flex items-center gap-3 rounded-2xl border border-[#B67C52]/20 bg-white px-4 py-3 cursor-pointer text-sm text-[#7B4A1E] shadow-sm transition hover:border-[#B67C52]">
                        <FileText className="w-5 h-5" />
                        <span>{form.governmentId?.name || 'Upload document (JPG/PNG/PDF, max 10MB)'}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0] ?? null;
                            if (f && f.size > 10 * 1024 * 1024) {
                              setErrors(prev => ({ ...prev, governmentId: 'File too large (max 10MB)' }));
                              return;
                            }
                            handleChange('governmentId', f);
                          }}
                        />
                      </label>
                    </div>
                    {errors.governmentId && <p className="text-red-500 text-xs mt-2">{errors.governmentId}</p>}
                    {errors.governmentIdType && <p className="text-red-500 text-xs mt-2">{errors.governmentIdType}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-earth font-montserrat">Additional Notes (optional)</label>
                    <textarea value={form.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="input-luxury mt-2 h-24" />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-gold text-sm font-semibold"
                    style={{ borderRadius: '12px', height: '48px', padding: '14px 28px' }}
                  >
                    Request Booking
                  </button>
                </form>
              </motion.div>
            </section>

            <aside className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="luxury-card p-8 bg-[#FFF8EE]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B67C52] text-white shadow-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-earth">Why Book With Us?</h3>
                    <p className="text-sm text-stone font-poppins">Fast support, premium cars, and flexible pickup.</p>
                  </div>
                </div>
                <ul className="space-y-4 text-stone font-poppins text-sm">
                  <li>• Elegant, transparent booking experience.</li>
                  <li>• Modern luxury cars maintained to the highest standard.</li>
                  <li>• Fast WhatsApp and phone follow-up after submission.</li>
                  <li>• Responsive support across desktop and mobile.</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="luxury-card p-8"
              >
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7B4A1E] mb-4">Booking details</div>
                <div className="space-y-4 text-sm text-stone font-poppins">
                  <div>
                    <p className="font-semibold text-earth">Request confirmation</p>
                    <p className="mt-1 text-[#6B5B4F]">Our team contacts you within 30 minutes.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-earth">Document safety</p>
                    <p className="mt-1 text-[#6B5B4F]">Secure uploads for identity verification only.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-earth">Flexible pickup</p>
                    <p className="mt-1 text-[#6B5B4F]">Choose your pickup location across cities.</p>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed left-1/2 top-24 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-emerald-200 bg-white px-6 py-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-poppins text-sm font-semibold">{success}</span>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}

