import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, MessageSquare, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WA_NUMBER = '919036444477';
const waUrl = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.message) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('inquiries').insert([form]);
    setLoading(false);
    if (err) {
      setError('Failed to send message. Please try again.');
    } else {
      setSent(true);
      setForm({ name: '', phone: '', email: '', message: '' });
    }
  }

  return (
    <section id="contact" className="py-24 px-4 bg-cream-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 border border-brown/30 bg-brown/5 rounded-full px-4 py-2 mb-6">
            <MessageSquare className="w-3.5 h-3.5 text-brown" />
            <span className="font-montserrat text-xs tracking-widest text-brown uppercase">Get In Touch</span>
          </div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-earth mb-4">
            Contact <span className="text-gradient-brown">Us</span>
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-brown to-transparent mx-auto mb-6" />
          <p className="text-stone font-poppins max-w-lg mx-auto">
            Ready to experience luxury on wheels? Reach out to us for bookings, inquiries, or any assistance.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h3 className="font-playfair text-2xl font-bold text-earth mb-8">Let's Connect</h3>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-brown/10 border border-brown/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-brown" />
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-earth mb-1">Our Location</h4>
                  <p className="text-stone font-poppins text-sm leading-relaxed">
                    Classic Car Rental<br />
                    653, 4th Main, near by JSS Dental College<br />
                    Shivarathreeshwara Nagar, Bannimantap<br />
                    Mysuru, Karnataka 570015<br />
                    India
                  </p>
                  <a
                    href="https://maps.app.goo.gl/dh2JPFBSuYRkwKWA7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex mt-3 items-center gap-2 text-sm font-semibold text-brown hover:underline"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-brown/10 border border-brown/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-brown" />
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-earth mb-1">Phone / WhatsApp</h4>
                  <a href="tel:9036444477" className="text-brown hover:text-brown-dark font-poppins text-lg font-semibold block transition-colors">
                    9036444477
                  </a>
                  <a href="tel:7406444477" className="text-brown hover:text-brown-dark font-poppins text-lg font-semibold block transition-colors">
                    7406444477
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-brown/10 border border-brown/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-brown" />
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-earth mb-1">Email</h4>
                  <a href="mailto:info@classiccar.rentals" className="text-brown hover:text-brown-dark font-poppins text-sm transition-colors">
                    info@classiccar.rentals
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Actions */}
            <div className="rounded-xl border border-green-500/30 bg-green-50 p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="white"/></svg>
                </div>
                <div>
                  <h4 className="font-montserrat font-bold text-green-700 text-sm">Chat on WhatsApp</h4>
                  <p className="text-xs text-green-600 font-poppins">Instant response — we reply in minutes!</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={waUrl('Hello Classic Car Rentals,\n\nI would like to book a vehicle.\nVehicle: \nPickup Date: \nDrop Date: \n\nPlease share availability and pricing.')}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 font-montserrat font-semibold text-xs text-white py-2.5 rounded-lg transition-all hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="white"/></svg>
                  Book a Car
                </a>
                <a
                  href={waUrl('Hello Classic Car Rentals,\n\nI have a general inquiry. Please assist.')}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 font-montserrat font-semibold text-xs text-green-700 py-2.5 rounded-lg border border-green-500/40 transition-all hover:bg-green-100"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#4ade80"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="#4ade80"/></svg>
                  General Inquiry
                </a>
              </div>
            </div>

            {/* Map Embed Placeholder */}
            <div className="rounded-xl overflow-hidden border border-brown/20 h-48 bg-cream flex items-center justify-center">
                <div className="text-center">
                <MapPin className="w-10 h-10 text-brown/40 mx-auto mb-3" />
                <p className="text-stone font-poppins text-sm">653, 4th Main, near by JSS Dental College<br/>Shivarathreeshwara Nagar, Bannimantap<br/>Mysuru, Karnataka 570015</p>
                <a
                  href="https://maps.app.goo.gl/dh2JPFBSuYRkwKWA7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-brown/10 px-4 py-2 text-sm text-brown font-montserrat"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-8">
              <span className="text-stone font-poppins text-sm">Follow us:</span>
              {['Facebook', 'Instagram', 'YouTube', 'WhatsApp'].map(s => (
                <motion.a
                  key={s}
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="text-xs font-montserrat font-semibold text-brown/70 hover:text-brown transition-colors border border-brown/20 px-3 py-1.5 rounded-full hover:border-brown/60"
                >
                  {s}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="luxury-card p-8">
              <h3 className="font-playfair text-2xl font-bold text-earth mb-6">
                Send an <span className="text-gradient-brown">Inquiry</span>
              </h3>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 rounded-full bg-green-100 border border-green-300 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="font-playfair text-xl font-bold text-earth mb-2">Message Sent!</h4>
                  <p className="text-stone font-poppins text-sm mb-6">
                    Thank you for reaching out. Our team will contact you within 30 minutes.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="btn-outline-gold text-sm"
                  >
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="John Doe"
                        className="input-luxury"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+91 9876543210"
                        className="input-luxury"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="input-luxury"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-montserrat font-semibold text-brown uppercase tracking-wider mb-2">
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us about your travel plans, preferred car, dates..."
                      rows={5}
                      className="input-luxury resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm font-poppins">{error}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-gold justify-center py-4 text-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Inquiry
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
