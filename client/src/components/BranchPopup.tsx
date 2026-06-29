import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Crown } from 'lucide-react';

type BranchPopupProps = {
  open: boolean;
  onClose: () => void;
};

export default function BranchPopup({ open, onClose }: BranchPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-earth/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ duration: 0.35, type: 'spring', damping: 20 }}
            className="relative w-full max-w-md rounded-2xl overflow-hidden z-10"
            style={{ background: '#FFFFFF', border: '1px solid rgba(123,74,30,0.2)' }}
          >
            {/* Brown animated top bar */}
            <div
              className="h-1.5 w-full"
              style={{ background: 'linear-gradient(90deg, #7B4A1E, #C4A574, #5C3715, #7B4A1E)', backgroundSize: '300% 100%', animation: 'shimmer 3s infinite linear' }}
            />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-brown/20 flex items-center justify-center text-stone hover:text-earth hover:border-brown/40 transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 text-center bg-cream-light">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 border border-brown/30 bg-brown/5 rounded-full px-4 py-1.5 mb-6">
                <Crown className="w-3.5 h-3.5 text-brown" />
                <span className="font-montserrat text-[11px] tracking-widest text-brown uppercase font-semibold">Associated Branch</span>
              </div>

              {/* Logo / Title */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-brown"
                style={{ background: 'linear-gradient(135deg, #7B4A1E, #5C3715)' }}
              >
                <Crown className="w-10 h-10 text-cream" />
              </div>

              <h2 className="font-playfair text-3xl font-bold text-earth mb-2">
                Rashdan<br />
                <span className="text-gradient-brown">Car Rental</span>
              </h2>

              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-brown to-transparent mx-auto my-4" />

              {/* Coming Soon Animation */}
              <div className="mb-6">
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full border"
                  style={{ borderColor: 'rgba(123,74,30,0.3)', background: 'rgba(123,74,30,0.05)' }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2.5 h-2.5 rounded-full bg-brown"
                  />
                  <span className="font-montserrat font-bold text-brown text-sm tracking-widest uppercase">
                    Coming Soon
                  </span>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    className="w-2.5 h-2.5 rounded-full bg-brown"
                  />
                </motion.div>
              </div>

              <p className="font-poppins text-stone text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                We're expanding! <span className="text-brown font-semibold">Rashdan Car Rental</span> will be
                opening soon with the same premium self-drive experience you love.
              </p>

              {/* Info cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="luxury-card p-4 text-center">
                  <MapPin className="w-5 h-5 text-brown mx-auto mb-2" />
                  <div className="text-xs text-stone font-poppins">Location</div>
                  <div className="text-sm text-earth font-montserrat font-semibold mt-1">Opening Soon</div>
                </div>
                <div className="luxury-card p-4 text-center">
                  <Clock className="w-5 h-5 text-brown mx-auto mb-2" />
                  <div className="text-xs text-stone font-poppins">Launch</div>
                  <div className="text-sm text-earth font-montserrat font-semibold mt-1">2026</div>
                </div>
              </div>

              {/* Stay connected */}
              <p className="text-xs text-stone font-poppins mb-4">
                Stay connected — we'll announce the launch soon!
              </p>

              <div className="flex gap-3">
                <a
                  href="https://wa.me/919036444477?text=Hello%2C%20I%20am%20interested%20in%20Rashdan%20Car%20Rental.%20Please%20notify%20me%20when%20it%20opens."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 font-montserrat font-semibold text-xs text-white py-3 rounded-xl transition-all hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2 6.496 2 12.05c0 1.861.484 3.607 1.334 5.122L2 22l4.962-1.302A10.018 10.018 0 0012.05 22c5.555 0 10.05-4.495 10.05-10.05C22.1 6.496 17.605 2 12.05 2zm0 18.35a8.295 8.295 0 01-4.232-1.157l-.304-.18-3.146.826.838-3.074-.198-.315a8.291 8.291 0 01-1.271-4.45c0-4.589 3.734-8.323 8.313-8.323 4.58 0 8.313 3.734 8.313 8.323 0 4.59-3.733 8.35-8.313 8.35z" fill="white"/></svg>
                  Notify Me
                </a>
                <button
                  onClick={onClose}
                  className="flex-1 btn-outline-gold text-xs py-3 justify-center"
                  style={{ borderRadius: '12px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
