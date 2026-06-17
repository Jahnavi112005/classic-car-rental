import { FormEvent, useState } from 'react';
import { Car, Calendar, FileText, CheckCircle2, ChevronRight, UploadCloud } from 'lucide-react';

const vehicles = ['Hatchback', 'Sedan', 'SUV', 'Luxury', 'Premium Luxury', '7-Seater'];
const featureTiles = ['Easy Booking', 'No Hidden Charges', 'Clean & Sanitized Cars', 'Flexible Cancellation'];

export default function BookingRequestSection() {
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  function handleChange(field: string, value: string | boolean | File | null) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const nextErrors: { [key: string]: string } = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full Name is required.';
    if (!form.mobileNumber.trim()) nextErrors.mobileNumber = 'Mobile Number is required.';
    if (!form.vehicle) nextErrors.vehicle = 'Please select a vehicle.';
    if (!form.pickupDate) nextErrors.pickupDate = 'Pickup Date is required.';
    if (!form.returnDate) nextErrors.returnDate = 'Return Date is required.';
    if (!form.drivingLicense) nextErrors.drivingLicense = 'Driving License upload is required.';
    if (!form.aadhaarCard) nextErrors.aadhaarCard = 'Aadhaar Card upload is required.';
    if (!form.agreed) nextErrors.agreed = 'You must agree to the Terms & Conditions.';
    if (form.pickupDate && form.returnDate && form.returnDate < form.pickupDate) {
      nextErrors.returnDate = 'Return Date must be after Pickup Date.';
    }
    return nextErrors;
  }

  function openWhatsApp() {
    const message = `🚗 CLASSIC CAR RENTAL - BOOKING REQUEST%0A%0AName: ${encodeURIComponent(form.fullName)}%0AMobile: ${encodeURIComponent(form.mobileNumber)}%0A%0AVehicle: ${encodeURIComponent(form.vehicle)}%0A%0APickup Date: ${encodeURIComponent(form.pickupDate)}%0AReturn Date: ${encodeURIComponent(form.returnDate)}%0A%0ADriving License: ${encodeURIComponent(form.drivingLicense?.name || 'Uploaded')}%0AAadhaar Card: ${encodeURIComponent(form.aadhaarCard?.name || 'Uploaded')}%0A%0ASent from Classic Car Rental Website`;
    const url = `https://wa.me/919036444477?text=${message}`;
    window.open(url, '_blank');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    openWhatsApp();
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 bg-cream">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-brown/15 bg-[#FFF5EA] px-4 py-2 text-xs uppercase tracking-[0.3em] font-montserrat text-brown">
            PREMIUM BOOKING
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mt-6">Quick Booking Request</h2>
          <p className="mt-4 text-stone max-w-2xl mx-auto font-poppins text-base leading-8">
            Fill in a few details and we&apos;ll take care of the rest.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
          <div className="luxury-card overflow-hidden rounded-[32px] border border-brown/15 bg-white shadow-card p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-earth font-montserrat">Full Name</label>
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
                  <label className="block text-sm font-semibold text-earth font-montserrat">Mobile Number</label>
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
                  <label className="block text-sm font-semibold text-earth font-montserrat">Vehicle</label>
                  <select
                    value={form.vehicle}
                    onChange={e => handleChange('vehicle', e.target.value)}
                    className="input-luxury mt-3"
                  >
                    <option value="">Select your preferred vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle} value={vehicle}>{vehicle}</option>
                    ))}
                  </select>
                  {errors.vehicle && <p className="mt-2 text-xs text-red-500">{errors.vehicle}</p>}
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-earth font-montserrat">Pickup Date</label>
                    <input
                      type="date"
                      value={form.pickupDate}
                      onChange={e => handleChange('pickupDate', e.target.value)}
                      className="input-luxury mt-3"
                    />
                    {errors.pickupDate && <p className="mt-2 text-xs text-red-500">{errors.pickupDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-earth font-montserrat">Return Date</label>
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

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-brown font-montserrat">Upload Documents</h3>
                    <p className="text-xs text-stone">JPG, PNG, PDF (Max 5MB)</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-[26px] border border-brown/15 bg-[#FFF7EE] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-3xl bg-brown p-3 text-white">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-earth">Driving License</p>
                        <p className="text-xs text-stone">Upload clear copy</p>
                      </div>
                    </div>
                    <label className="mt-2 flex cursor-pointer items-center justify-between rounded-[22px] border border-brown/15 bg-white px-4 py-4 text-sm font-semibold text-[#7B4A1E] shadow-sm transition hover:border-brown">
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

                  <div className="rounded-[26px] border border-brown/15 bg-[#FFF7EE] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-3xl bg-brown p-3 text-white">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-earth">Aadhaar Card</p>
                        <p className="text-xs text-stone">Upload clear copy</p>
                      </div>
                    </div>
                    <label className="mt-2 flex cursor-pointer items-center justify-between rounded-[22px] border border-brown/15 bg-white px-4 py-4 text-sm font-semibold text-[#7B4A1E] shadow-sm transition hover:border-brown">
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
              </div>

              <div className="rounded-[24px] border border-brown/15 bg-[#FFF7EE] p-5">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={e => handleChange('agreed', e.target.checked)}
                    id="booking-agree"
                    className="mt-1 h-4 w-4 rounded border-brown text-brown focus:ring-brown"
                  />
                  <span className="text-sm text-stone font-poppins">
                    I agree to the <a href="#" className="text-brown font-semibold underline">Terms & Conditions</a>
                  </span>
                </label>
                {errors.agreed && <p className="mt-3 text-xs text-red-500">{errors.agreed}</p>}
              </div>

              <button
                type="submit"
                className="w-full rounded-[24px] bg-brown px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_30px_rgba(123,74,30,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-brown-dark"
              >
                REQUEST BOOKING
              </button>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="luxury-card rounded-[32px] border border-brown/15 bg-[#FFF5EA] shadow-card overflow-hidden">
              <div className="relative overflow-hidden bg-[#FDF6EF] px-6 pt-8 pb-6">
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 620 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 200 C100 120 220 240 320 180 C420 120 520 200 620 140 L620 320 L0 320 Z" fill="#D8B59E" />
                  </svg>
                </div>
                <div className="relative rounded-[28px] bg-white/90 p-5 shadow-2xl">
                  <div className="rounded-[24px] border border-brown/10 bg-[#F8F3EA] p-4">
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-3xl bg-brown text-white grid place-items-center">
                          <Car className="w-6 h-6" />
                        </div>
                        <div className="rounded-3xl bg-[#FFF5EA] px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-brown">
                          Luxury
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-16 rounded-[24px] bg-[#F5E7DB]" />
                        <div className="h-3 rounded-full bg-[#E8D2B8] w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[32px] bg-[#FFF5EA] p-6">
                <h3 className="font-playfair text-2xl font-bold text-earth">Pick-Up & Drop Service</h3>
                <p className="mt-4 text-sm leading-relaxed text-stone">
                  Customers can opt for pick-up and drop services at their preferred location. Additional charges apply based on distance and location.
                </p>
                <div className="mt-6 space-y-4 text-sm text-stone">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brown text-white">✓</span>
                    <span>Professional drivers available: Sagar G</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brown text-white">✓</span>
                    <span>Professional drivers available: Mayab</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-[24px] bg-brown px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(123,74,30,0.18)] transition duration-300 hover:-translate-y-1 hover:bg-brown-dark"
                >
                  ENQUIRE NOW
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="luxury-card rounded-[32px] border border-brown/15 bg-white p-6 shadow-card">
              <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-brown font-montserrat">Why choose us?</h4>
              <div className="mt-5 space-y-4 text-sm text-stone">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF2E5] text-brown shadow-sm"><CheckCircle2 className="w-4 h-4" /></span>
                  <span>100% Safe & Insured</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF2E5] text-brown shadow-sm"><CheckCircle2 className="w-4 h-4" /></span>
                  <span>No Hidden Charges</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF2E5] text-brown shadow-sm"><CheckCircle2 className="w-4 h-4" /></span>
                  <span>Clean & Sanitized Cars</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF2E5] text-brown shadow-sm"><CheckCircle2 className="w-4 h-4" /></span>
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featureTiles.map(tile => (
            <div key={tile} className="rounded-[24px] border border-brown/10 bg-white px-5 py-4 text-sm font-medium text-earth shadow-sm">
              {tile}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
