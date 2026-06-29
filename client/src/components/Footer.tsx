import { Link } from 'react-router-dom';
import { Crown, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

type FooterProps = { onBranchClick?: () => void };

const quickLinks = ['Home', 'Fleet', 'About', 'Pricing', 'Testimonials', 'FAQ', 'Contact'];
const fleet = ['Hatchbacks', 'Sedans', 'SUVs', 'Luxury Cars', 'Premium Luxury', '7-Seater Cars'];
const support = ['How to Book', 'Documents Required', 'Cancellation Policy', 'Security Deposit', 'Roadside Assistance', 'Terms & Conditions'];

export default function Footer({ onBranchClick }: FooterProps = {}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-earth border-t border-brown/20">
      {/* CTA Banner */}
      <div className="border-b border-brown/20 py-12 px-4" style={{ background: 'linear-gradient(135deg, rgba(123,74,30,0.1) 0%, rgba(92,55,21,0.15) 50%, rgba(123,74,30,0.1) 100%)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-playfair text-2xl md:text-3xl font-bold text-cream mb-2">
              Ready to <span className="text-brown-light">Drive in Luxury?</span>
            </h3>
            <p className="text-stone-light font-poppins text-sm">
              Call / WhatsApp us now for instant booking
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="tel:9036444477" className="btn-gold text-base px-8 py-4">
              <Phone className="w-5 h-5" />
              9036444477
            </a>
            <a href="tel:7406444477" className="btn-outline-gold text-base px-8 py-4">
              <Phone className="w-5 h-5" />
              7406444477
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brown-gradient flex items-center justify-center shadow-brown">
                <Crown className="w-6 h-6 text-cream" />
              </div>
              <div>
                <div className="font-playfair text-xl font-bold text-gradient-brown leading-none">
                  CLASSIC CAR RENTAL
                </div>
                
              </div>
            </Link>

            <p className="text-stone font-poppins text-sm leading-relaxed mb-6 max-w-xs">
              Premium self-drive car rental. Experience luxury, comfort, and complete freedom
              on every journey. Your trusted travel partner since 2015.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-stone-light font-poppins">
                <MapPin className="w-4 h-4 text-brown flex-shrink-0" />
                Mysore, Karnataka - 570001
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-light font-poppins">
                <Phone className="w-4 h-4 text-brown flex-shrink-0" />
                9036444477 / 7406444477
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-light font-poppins">
                <Mail className="w-4 h-4 text-brown flex-shrink-0" />
                info@classiccar.rentals
              </div>
            </div>

            {/* Tagline */}
            <div className="mt-6 border border-brown/20 rounded-xl p-4 bg-brown/5">
              <p className="font-montserrat text-xs text-brown uppercase tracking-wider text-center">
                Luxury · Comfort · Trust
              </p>
              <p className="font-poppins text-xs text-stone text-center mt-1">
                SELF DRIVE · SAFE DRIVE · SMART DRIVE
              </p>
            </div>

            {/* Associated Branches */}
            <div className="mt-4 border border-brown/10 rounded-xl p-4">
              <p className="font-montserrat text-xs text-brown/60 uppercase tracking-widest text-center mb-3">Associated Branches</p>
              <button
                onClick={onBranchClick}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-brown/20 hover:border-brown/40 hover:bg-brown/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brown/10 border border-brown/20 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-brown" />
                  </div>
                  <div className="text-left">
                    <div className="font-montserrat text-xs font-semibold text-cream">Rashdan Car Rental</div>
                    <div className="text-[10px] text-brown-light font-poppins">Coming Soon · Opening 2026</div>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full border border-brown/30 flex items-center justify-center group-hover:border-brown transition-colors">
                  <ArrowRight className="w-3 h-3 text-brown" />
                </div>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-montserrat text-sm font-bold text-brown uppercase tracking-wider mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link}>
                  <Link
                    to={link === 'Home' ? '/' : link === 'Fleet' ? '/fleet' : `/#${link.toLowerCase()}`}
                    className="font-poppins text-sm text-stone-light hover:text-brown transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 text-brown/40 group-hover:text-brown transition-colors" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fleet */}
          <div>
            <h4 className="font-montserrat text-sm font-bold text-brown uppercase tracking-wider mb-6">
              Our Fleet
            </h4>
            <ul className="space-y-3">
              {fleet.map(item => (
                <li key={item}>
                  <Link
                    to="/fleet"
                    className="font-poppins text-sm text-stone-light hover:text-brown transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 text-brown/40 group-hover:text-brown transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-montserrat text-sm font-bold text-brown uppercase tracking-wider mb-6">
              Support
            </h4>
            <ul className="space-y-3">
              {support.map(item => (
                <li key={item}>
                  <Link
                    to="/#faq"
                    className="font-poppins text-sm text-stone-light hover:text-brown transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 text-brown/40 group-hover:text-brown transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="font-montserrat text-sm font-bold text-brown uppercase tracking-wider mb-3">
                Newsletter
              </h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-cream-dark border border-brown/20 rounded-l-lg px-3 py-2.5 text-sm text-earth placeholder-stone focus:outline-none focus:border-brown/40"
                />
                <button className="bg-brown-gradient px-3 py-2.5 rounded-r-lg hover:shadow-brown transition-all">
                  <ArrowRight className="w-4 h-4 text-cream" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brown/10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone text-xs font-poppins text-center md:text-left">
            © {currentYear} Classic Car Rental. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-xs text-stone hover:text-brown font-poppins transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-xs text-stone hover:text-brown font-poppins transition-colors">Terms of Service</Link>
            <Link to="#" className="text-xs text-stone hover:text-brown font-poppins transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
