import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fuel, Settings, Users, Star, CheckCircle, ArrowLeft, Calendar, MapPin, Phone, FileText } from 'lucide-react';
import { getCountrySupportText, getDocumentHelperText, getDocumentPlaceholder, validateDocumentNumber, formatDocumentNumberInput, sanitizeDocumentNumber } from '../utils/documentValidation';
import { bookingApi, documentApi, vehicleApi } from '../services/api';
import { Booking, Car } from '../types';
import VehicleImage from '../components/VehicleImage';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import EmailFloat from '../components/EmailFloat';
import { whatsAppUrl } from '../utils/whatsapp';

type IdentityDocumentType = 'driving_license' | 'aadhaar' | 'passport' | 'pan' | '';

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [bookError, setBookError] = useState('');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [documentForm, setDocumentForm] = useState({
    fullName: '',
    documentNumber: '',
    documentType: '' as IdentityDocumentType,
    country: '',
    governmentId: null as File | null,
  });
  const [documentValidation, setDocumentValidation] = useState({ message: '', isValid: null as boolean | null });
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [bookForm, setBookForm] = useState({
    pickupLocation: '',
    dropLocation: '',
    pickupDate: today,
    dropDate: tomorrow,
    pickupTime: '10:00',
    dropTime: '10:00',
    notes: '',
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchCar() {
      if (!id) return;
      const data = await vehicleApi.get(id);
      if (cancelled) return;
      setCar(data);
      setLoading(false);
    }
    fetchCar();
    const interval = window.setInterval(fetchCar, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [id]);

  function getTotalDays() {
    const pickup = new Date(bookForm.pickupDate);
    const drop = new Date(bookForm.dropDate);
    const diff = Math.ceil((drop.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }

  async function handleBook() {
    if (!bookForm.pickupLocation) {
      setBookError('Please enter pickup location.');
      return;
    }
    if (!documentForm.fullName.trim() || !documentForm.documentNumber.trim() || !documentForm.documentType || !documentForm.country.trim() || !documentForm.governmentId) {
      setBookError('Please complete the government ID upload and verification details.');
      return;
    }
    const documentValidation = validateDocumentNumber(documentForm.documentType, documentForm.documentNumber);
    if (documentValidation.isValid === false) {
      setBookError(documentValidation.message);
      return;
    }
    setBookError('');
    setBookLoading(true);
    const days = getTotalDays();
    let error: unknown = null;
    try {
      const fd = new FormData();
      fd.append('file', documentForm.governmentId as Blob);
      fd.append('type', documentForm.documentType);
      fd.append('documentType', documentForm.documentType);
      fd.append('fullName', documentForm.fullName);
      fd.append('documentNumber', sanitizeDocumentNumber(documentForm.documentType, documentForm.documentNumber));
      fd.append('country', documentForm.country);

      const doc = await documentApi.upload(fd);
      if (!doc || (doc.status !== 'verified' && doc.verificationStatus !== 'verified')) {
        throw new Error(doc?.verificationMessage || 'Identity verification failed.');
      }

      const booking = await bookingApi.createGuest({
        car_id: car!.id,
        pickup_location: bookForm.pickupLocation,
        drop_location: bookForm.dropLocation || bookForm.pickupLocation,
        pickup_date: bookForm.pickupDate,
        drop_date: bookForm.dropDate,
        pickup_time: bookForm.pickupTime,
        drop_time: bookForm.dropTime,
        total_days: days,
        total_amount: days * car!.price_per_day,
        security_deposit: car!.security_deposit,
        notes: bookForm.notes,
        booking_status: 'pending',
        payment_status: 'pending',
        document: doc._id || doc.id,
        customer: {
          name: documentForm.fullName,
          email: user?.email || '',
          phone: '',
          address: bookForm.pickupLocation,
          documentNumber: documentForm.documentNumber,
          country: documentForm.country,
        },
      });
      setCreatedBooking(booking);
    } catch (err) {
      error = err;
    }
    setBookLoading(false);
    if (error) {
      setBookError(error instanceof Error ? error.message : 'Booking failed. Please try again.');
    } else {
      setBookSuccess(true);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-brown/20 border-t-brown rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-playfair text-2xl font-bold text-earth mb-4">Car Not Found</h2>
          <Link to="/fleet" className="btn-gold">Back to Fleet</Link>
        </div>
      </div>
    );
  }

  const totalDays = getTotalDays();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link to="/fleet" className="inline-flex items-center gap-2 text-stone hover:text-brown transition-colors font-poppins text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Fleet
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Car Details */}
            <div>
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <VehicleImage
                  vehicle={car}
                  alt={car.name}
                  wrapperClassName="rounded-2xl overflow-hidden mb-6 border border-brown/20"
                  wrapperStyle={{ height: '360px' }}
                  imgClassName="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4">
                  <span className="font-montserrat text-xs font-semibold px-3 py-1.5 bg-brown text-cream rounded-full">{car.category}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-brown-light fill-brown-light" />
                    <span className="text-white font-semibold">{car.rating}</span>
                    <span className="text-cream/80 text-sm">({car.reviews_count} reviews)</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${((car.status || (car.availability ? 'available' : 'booked')) === 'available') ? 'bg-green-500/20 border border-green-500/40 text-green-600' : ((car.status === 'maintenance') ? 'bg-orange-500/20 border border-orange-500/40 text-orange-600' : 'bg-red-500/20 border border-red-500/40 text-red-600')}`}>
                    <div className={`w-2 h-2 rounded-full ${((car.status || (car.availability ? 'available' : 'booked')) === 'available') ? 'bg-green-500' : (car.status === 'maintenance' ? 'bg-orange-500' : 'bg-red-500')}`} />
                    <span className="text-xs font-montserrat font-semibold">{car.status || (car.availability ? 'Available' : 'Booked')}</span>
                  </div>
                </div>
              </motion.div>

              {/* Car Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h1 className="font-playfair text-3xl font-bold text-earth mb-2">{car.name}</h1>
                <p className="text-stone font-poppins mb-6">{car.brand} · {car.model} · {car.year}</p>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Fuel, label: 'Fuel', value: car.fuel_type },
                    { icon: Settings, label: 'Transmission', value: car.transmission },
                    { icon: Users, label: 'Seats', value: `${car.seats} Seater` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="luxury-card p-4 text-center">
                      <Icon className="w-5 h-5 text-brown mx-auto mb-2" />
                      <div className="text-xs text-stone font-poppins mb-1">{label}</div>
                      <div className="text-sm text-earth font-semibold font-montserrat">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div className="luxury-card p-6 mb-6">
                  <h3 className="font-playfair text-lg font-bold text-brown mb-3">About this Car</h3>
                  <p className="text-earth-light font-poppins text-sm leading-relaxed">{car.description}</p>
                </div>

                {/* Features */}
                {car.features.length > 0 && (
                  <div className="luxury-card p-6 mb-6">
                    <h3 className="font-playfair text-lg font-bold text-brown mb-4">Features & Amenities</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {car.features.map(f => (
                        <div key={f} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-brown flex-shrink-0" />
                          <span className="text-sm text-earth-light font-poppins">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Info */}
                <div className="luxury-card p-6">
                  <h3 className="font-playfair text-lg font-bold text-brown mb-4">Pricing Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-stone font-poppins text-sm">Rate per Day</span>
                      <span className="text-earth font-semibold">₹{car.price_per_day.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone font-poppins text-sm">Security Deposit</span>
                      <span className="text-earth font-semibold">₹{car.security_deposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone font-poppins text-sm">KM Limit</span>
                      <span className="text-earth font-semibold">300 km/day</span>
                    </div>
                    <div className="flex justify-between border-t border-brown/10 pt-3">
                      <span className="text-stone font-poppins text-sm">Fuel & Tolls</span>
                      <span className="text-brown font-semibold text-sm">Extra</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right - Booking Form */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="luxury-card p-8 sticky top-24"
              >
                {/* Price header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="font-playfair text-3xl font-bold text-gradient-brown">₹{car.price_per_day.toLocaleString()}</span>
                    <span className="text-stone font-poppins"> /day</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-brown-light fill-brown-light" />
                    <span className="text-earth font-semibold">{car.rating}</span>
                  </div>
                </div>

                {bookSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 border border-green-300 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-earth mb-2">Booking Requested!</h3>
                    <p className="text-stone font-poppins text-sm mb-2">
                      Your booking request is pending approval. We'll contact you within 30 minutes.
                    </p>
                    {createdBooking?.bookingId && (
                      <p className="text-stone font-poppins text-sm mb-2">
                        Booking ID: <span className="font-semibold text-earth">{createdBooking.bookingId}</span>
                      </p>
                    )}
                    <p className="text-stone font-poppins text-sm mb-6">
                      Status: <span className="font-semibold text-earth">Pending</span>
                    </p>
                    <Link to="/booking" className="btn-gold justify-center w-full" style={{ borderRadius: '8px' }}>
                      Continue Booking
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">
                          <MapPin className="w-3 h-3 inline mr-1" />Pickup Location *
                        </label>
                        <input type="text" value={bookForm.pickupLocation} onChange={e => setBookForm(p => ({ ...p, pickupLocation: e.target.value }))} placeholder="Enter pickup address" className="input-luxury" />
                      </div>
                      <div>
                        <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">
                          <MapPin className="w-3 h-3 inline mr-1" />Drop Location
                        </label>
                        <input type="text" value={bookForm.dropLocation} onChange={e => setBookForm(p => ({ ...p, dropLocation: e.target.value }))} placeholder="Same as pickup" className="input-luxury" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">
                            <Calendar className="w-3 h-3 inline mr-1" />Pickup Date
                          </label>
                          <input type="date" value={bookForm.pickupDate} min={today} onChange={e => setBookForm(p => ({ ...p, pickupDate: e.target.value }))} className="input-luxury" />
                        </div>
                        <div>
                          <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">
                            <Calendar className="w-3 h-3 inline mr-1" />Drop Date
                          </label>
                          <input type="date" value={bookForm.dropDate} min={bookForm.pickupDate} onChange={e => setBookForm(p => ({ ...p, dropDate: e.target.value }))} className="input-luxury" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6 border-t border-brown/10 pt-6">
                      <div>
                        <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">
                          <FileText className="w-3 h-3 inline mr-1" />Upload Government ID
                        </label>
                        <div className="grid gap-4 md:grid-cols-2">
                          <input
                            type="text"
                            value={documentForm.fullName}
                            onChange={e => setDocumentForm(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Full name as on document"
                            className="input-luxury"
                          />
                          <input
                            type="text"
                            value={documentForm.documentNumber}
                            onChange={e => {
                              const formatted = formatDocumentNumberInput(documentForm.documentType, e.target.value);
                              setDocumentForm(prev => ({ ...prev, documentNumber: formatted }));
                              const validation = validateDocumentNumber(documentForm.documentType, formatted);
                              setDocumentValidation({ message: validation.message, isValid: validation.isValid });
                            }}
                            placeholder={getDocumentPlaceholder(documentForm.documentType)}
                            className="input-luxury"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                          <select
                            value={documentForm.documentType}
                            onChange={e => {
                              const nextType = e.target.value as IdentityDocumentType;
                              setDocumentForm(prev => ({ ...prev, documentType: nextType, documentNumber: '' }));
                              setDocumentValidation({ message: '', isValid: null });
                            }}
                            className="input-luxury"
                          >
                            <option value="">Select document type</option>
                            <option value="driving_license">Driving License</option>
                            <option value="aadhaar">Aadhaar Card</option>
                            <option value="passport">Passport</option>
                            <option value="pan">PAN Card</option>
                          </select>
                          <input
                            type="text"
                            value={documentForm.country}
                            onChange={e => setDocumentForm(prev => ({ ...prev, country: e.target.value }))}
                            placeholder="Country"
                            className="input-luxury"
                          />
                        </div>
                        {documentForm.documentType ? (
                          <p className="text-[11px] text-stone mt-2">{getDocumentHelperText(documentForm.documentType)}</p>
                        ) : null}
                        {documentValidation.message ? (
                          <p className={`text-xs mt-2 ${documentValidation.isValid ? 'text-green-600' : documentValidation.isValid === false ? 'text-amber-600' : 'text-stone'}`}>{documentValidation.message}</p>
                        ) : null}
                        {getCountrySupportText(documentForm.country) ? (
                          <div className="mt-3 rounded-xl border border-[#B67C52]/10 bg-[#FFF8EE] px-3 py-2 text-[11px] text-stone">
                            <p className="font-semibold text-[#7B4A1E] mb-1">{getCountrySupportText(documentForm.country)?.[0]}</p>
                            {getCountrySupportText(documentForm.country)?.slice(1).map(item => <p key={item}>{item}</p>)}
                          </div>
                        ) : null}
                        <label className="flex items-center gap-3 rounded-2xl border border-[#B67C52]/20 bg-white px-4 py-3 cursor-pointer text-sm text-[#7B4A1E] shadow-sm transition hover:border-[#B67C52] mt-4">
                          <FileText className="w-5 h-5" />
                          <span>{documentForm.governmentId?.name || 'Upload document (JPG/PNG/PDF, max 10MB)'}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0] ?? null;
                              if (file && file.size > 10 * 1024 * 1024) {
                                setBookError('File too large (max 10MB).');
                                return;
                              }
                              setDocumentForm(prev => ({ ...prev, governmentId: file }));
                            }}
                          />
                        </label>
                        <div className="mt-3 rounded-2xl border border-[#B67C52]/10 bg-[#FFF8EE] px-4 py-3 text-[11px] text-stone">
                          <p className="font-semibold text-[#7B4A1E] mb-1">Accepted Formats:</p>
                          <p>JPG, JPEG, PNG, PDF</p>
                          <p className="font-semibold text-[#7B4A1E] mt-2 mb-1">Maximum Size:</p>
                          <p>10 MB</p>
                          <p className="font-semibold text-[#7B4A1E] mt-2 mb-1">Upload Guidance:</p>
                          <p>Make sure the entire document is visible, with no blur, no flash reflection, all four corners visible, and upload the original document.</p>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-cream-dark rounded-xl p-4 mb-6 border border-brown/10">
                      <div className="flex justify-between mb-2">
                        <span className="text-stone font-poppins text-sm">₹{car.price_per_day.toLocaleString()} × {totalDays} day{totalDays > 1 ? 's' : ''}</span>
                        <span className="text-earth font-semibold">₹{(car.price_per_day * totalDays).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-stone font-poppins text-sm">Security Deposit</span>
                        <span className="text-earth font-semibold">₹{car.security_deposit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-brown/10 pt-3">
                        <span className="text-brown font-montserrat font-bold">Total Payable</span>
                        <span className="text-gradient-brown font-playfair font-bold text-xl">₹{((car.price_per_day * totalDays) + car.security_deposit).toLocaleString()}</span>
                      </div>
                    </div>

                    {bookError && (
                      <p className="text-red-500 text-sm font-poppins mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{bookError}</p>
                    )}

                    <motion.button
                      whileHover={{ scale: !bookLoading && ((car.status || (car.availability ? 'available' : 'booked')) === 'available') ? 1.02 : 1 }}
                      whileTap={{ scale: !bookLoading && ((car.status || (car.availability ? 'available' : 'booked')) === 'available') ? 0.98 : 1 }}
                      onClick={handleBook}
                      disabled={bookLoading || ((car.status || (car.availability ? 'available' : 'booked')) !== 'available')}
                      className={`w-full justify-center py-4 mb-4 rounded-2xl text-sm font-semibold transition ${((car.status || (car.availability ? 'available' : 'booked')) === 'available') ? 'btn-gold' : 'bg-white/10 text-[#7A7466] cursor-not-allowed'}`}
                      style={{ borderRadius: '8px' }}
                    >
                      {bookLoading ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />Processing...</span>
                      ) : ((car.status || (car.availability ? 'available' : 'booked')) !== 'available') ? 'Not Available' : 'Verify & Book'}
                    </motion.button>

                    <div className="flex gap-2">
                      <a href="tel:9036444477" className="flex-1 btn-outline-gold justify-center py-3" style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <Phone className="w-4 h-4" />
                        Call Us
                      </a>
                      <a
                        href={whatsAppUrl(car.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 font-montserrat font-semibold text-white py-3 rounded-lg transition-all hover:opacity-90"
                        style={{ background: '#25D366', fontSize: '12px', borderRadius: '8px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="white"/></svg>
                        WhatsApp
                      </a>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <WhatsAppFloat />
      <EmailFloat />
    </div>
  );
}



