import React, { FormEvent, useEffect, useState } from 'react';
import { Car, CheckCircle2, UploadCloud, X } from 'lucide-react';

const vehicles = ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Premium Luxury', '7-Seater'];
const featureTiles = ['Easy Booking', 'No Hidden Charges', 'Clean & Sanitized Cars', 'Flexible Cancellation'];

export default function BookingRequestSection(): JSX.Element {
  const [form, setForm] = useState({
    fullName: '',
    mobileNumber: '',
    vehicle: '',
    pickupDate: '',
    returnDate: '',
    drivingLicense: null as File | null,
    aadhaarCard: null as File | null,
    agreed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setModalOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.addEventListener('openBookingForm', handleOpen as EventListener);
    return () => window.removeEventListener('openBookingForm', handleOpen as EventListener);
  }, []);

  function handleChange(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = 'Full Name is required.';
    if (!form.mobileNumber.trim()) next.mobileNumber = 'Mobile Number is required.';
    if (!form.vehicle) next.vehicle = 'Please select a vehicle.';
    if (!form.pickupDate) next.pickupDate = 'Pickup Date is required.';
    if (!form.returnDate) next.returnDate = 'Return Date is required.';
    if (!form.drivingLicense) next.drivingLicense = 'Driving License upload is required.';
    if (!form.aadhaarCard) next.aadhaarCard = 'Aadhaar Card upload is required.';
    if (!form.agreed) next.agreed = 'You must agree to the Terms & Conditions.';
    if (form.pickupDate && form.returnDate && form.returnDate < form.pickupDate) {
      next.returnDate = 'Return Date must be after Pickup Date.';
    }
    return next;
  }

  function openWhatsApp() {
    const message = `🚗 CLASSIC CAR RENTAL - BOOKING REQUEST%0A%0AName: ${encodeURIComponent(
      form.fullName
    )}%0AMobile: ${encodeURIComponent(form.mobileNumber)}%0A%0AVehicle: ${encodeURIComponent(
      form.vehicle
    )}%0A%0APickup Date: ${encodeURIComponent(form.pickupDate)}%0AReturn Date: ${encodeURIComponent(
      form.returnDate
    )}%0A%0ADriving License: ${encodeURIComponent(form.drivingLicense?.name || 'Uploaded')}%0AAadhaar Card: ${encodeURIComponent(
      form.aadhaarCard?.name || 'Uploaded'
    )}%0A%0ASent from Classic Car Rental Website`;
    const url = `https://wa.me/919036444477?text=${message}`;
    window.open(url, '_blank');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    openWhatsApp();
  }

  function closeModal() {
    setModalOpen(false);
  }

  function BookingForm() {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              className="input-luxury mt-3"
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="mt-2 text-xs text-red-500">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold">Mobile Number</label>
            <input
              type="tel"
              value={form.mobileNumber}
              onChange={e => handleChange('mobileNumber', e.target.value)}
              className="input-luxury mt-3"
              placeholder="Enter mobile number"
            />
            {errors.mobileNumber && <p className="mt-2 text-xs text-red-500">{errors.mobileNumber}</p>}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold">Vehicle</label>
            <select
              value={form.vehicle}
              onChange={e => handleChange('vehicle', e.target.value)}
              className="input-luxury mt-3"
            >
              <option value="">Select your preferred vehicle</option>
              {vehicles.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            {errors.vehicle && <p className="mt-2 text-xs text-red-500">{errors.vehicle}</p>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold">Pickup Date</label>
              <input
                type="date"
                value={form.pickupDate}
                onChange={e => handleChange('pickupDate', e.target.value)}
                className="input-luxury mt-3"
              />
              {errors.pickupDate && <p className="mt-2 text-xs text-red-500">{errors.pickupDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold">Return Date</label>
              <input
                type="date"
                value={form.returnDate}
                onChange={e => handleChange('returnDate', e.target.value)}
                className="input-luxury mt-3"
                min={form.pickupDate || undefined}
              />
              {errors.returnDate && <p className="mt-2 text-xs text-red-500">{errors.returnDate}</p>}
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[26px] border p-5 bg-[#FFF7EE]">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-3xl bg-brown p-3 text-white">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Driving License</p>
                <p className="text-xs text-stone">Upload clear copy</p>
              </div>
            </div>
            <label className="mt-2 flex cursor-pointer items-center justify-between rounded-[22px] border bg-white px-4 py-4 text-sm font-semibold text-[#7B4A1E] shadow-sm">
              <span>{form.drivingLicense?.name || 'Upload File'}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => handleChange('drivingLicense', e.target.files?.[0] ?? null)}
              />
            </label>
            {errors.drivingLicense && <p className="mt-2 text-xs text-red-500">{errors.drivingLicense}</p>}
          </div>

          <div className="rounded-[26px] border p-5 bg-[#FFF7EE]">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-3xl bg-brown p-3 text-white">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Aadhaar Card</p>
                <p className="text-xs text-stone">Upload clear copy</p>
              </div>
            </div>
            <label className="mt-2 flex cursor-pointer items-center justify-between rounded-[22px] border bg-white px-4 py-4 text-sm font-semibold text-[#7B4A1E] shadow-sm">
              <span>{form.aadhaarCard?.name || 'Upload File'}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={e => handleChange('aadhaarCard', e.target.files?.[0] ?? null)}
              />
            </label>
            {errors.aadhaarCard && <p className="mt-2 text-xs text-red-500">{errors.aadhaarCard}</p>}
          </div>
        </div>

        <div className="rounded-[24px] border p-5 bg-[#FFF7EE]">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={e => handleChange('agreed', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-brown text-brown"
            />
            <span className="text-sm text-stone">I agree to the <a href="#" className="text-brown font-semibold underline">Terms & Conditions</a></span>
          </label>
          {errors.agreed && <p className="mt-3 text-xs text-red-500">{errors.agreed}</p>}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="flex-1 rounded-[24px] bg-brown px-6 py-4 text-sm font-semibold uppercase text-white">REQUEST BOOKING</button>
          <button type="button" onClick={closeModal} className="inline-flex items-center justify-center rounded-[24px] border px-6 py-4 text-sm font-semibold text-earth bg-white">Close</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border bg-[#FFF5EA] px-4 py-2 text-xs uppercase tracking-[0.3em] text-brown">PREMIUM BOOKING</div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mt-6">Quick Booking Request</h2>
            <p className="mt-4 text-stone max-w-2xl mx-auto text-base leading-8">Fill in a few details and we&apos;ll take care of the rest.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
            <div className="luxury-card overflow-hidden rounded-[32px] border bg-white p-8 md:p-10">
              <BookingForm />
            </div>

            <aside className="space-y-6">
              <div className="luxury-card rounded-[32px] border bg-[#FFF5EA] p-6">
                <div className="rounded-[24px] border bg-[#F8F3EA] p-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-3xl bg-brown text-white grid place-items-center"><Car className="w-6 h-6" /></div>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-playfair text-2xl font-bold text-earth">Pick-Up & Drop Service</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">Customers can opt for pick-up and drop services. Additional charges apply based on distance.</p>
                </div>
              </div>

              <div className="luxury-card rounded-[32px] border bg-white p-6">
                <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-brown">Why choose us?</h4>
                <div className="mt-5 space-y-4 text-sm text-stone">
                  {featureTiles.map(tile => (
                    <div key={tile} className="flex items-center gap-3"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF2E5] text-brown"><CheckCircle2 className="w-4 h-4" /></span><span>{tile}</span></div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featureTiles.map(tile => (
              <div key={tile} className="rounded-[24px] border bg-white px-5 py-4 text-sm font-medium text-earth">{tile}</div>
            ))}
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-6xl mx-auto">
            <div className="luxury-card overflow-hidden rounded-[24px] border bg-white p-6 md:p-8">
              <button onClick={closeModal} aria-label="Close booking form" className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-white border p-2 shadow hover:scale-105 transition"><X className="w-4 h-4" /></button>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border bg-[#FFF5EA] px-4 py-2 text-xs uppercase tracking-[0.3em] text-brown">PREMIUM BOOKING</div>
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-earth mt-4">Quick Booking Request</h2>
                <p className="mt-3 text-stone max-w-2xl mx-auto text-sm leading-7">Fill in a few details and we&apos;ll take care of the rest.</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
                <div>
                  <BookingForm />
                </div>
                <aside className="space-y-6">
                  <div className="luxury-card rounded-[32px] border bg-[#FFF5EA] p-6">
                    <div className="rounded-[24px] border bg-[#F8F3EA] p-4">
                      <div className="flex items-center justify-between"><div className="h-12 w-12 rounded-3xl bg-brown text-white grid place-items-center"><Car className="w-6 h-6" /></div></div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
