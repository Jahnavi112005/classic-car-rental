import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Mail, MessageCircle } from 'lucide-react';

type Props = { onInquiry?: () => void };

const EMAIL = 'booking@classiccarrentals.in';
const SUBJECT = 'Complaint';
const BODY = encodeURIComponent(`Hello Classic Car Rentals,

I would like to raise a complaint regarding: \n\n`);

export default function EmailFloat({ onInquiry }: Props = {}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl overflow-hidden shadow-luxury"
            style={{
              width: '290px',
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#1F2937' }}>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-white font-montserrat font-bold text-sm">Email Support</div>
                <div className="text-white/80 text-xs font-poppins">Send a complaint by email</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4" style={{ background: '#f9fafb' }}>
              <div className="bg-white rounded-xl p-3 shadow-sm mb-4">
                <p className="text-sm font-poppins text-gray-700 leading-relaxed whitespace-pre-line">
                  {`Need help or want to raise a complaint?\n\nUse the button below to email us directly.`}
                </p>
                <div className="text-[10px] text-gray-400 text-right mt-1">Email</div>
              </div>
              <a
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${BODY}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-montserrat font-bold text-sm text-white transition-all hover:opacity-90 mb-2"
                style={{ background: '#2563EB' }}
              >
                <Mail className="w-4 h-4" />
                Email Complaint
              </a>
              {onInquiry && (
                <button
                  onClick={() => { setOpen(false); onInquiry(); }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-montserrat font-semibold text-sm transition-all border border-slate-300 text-slate-700 bg-white"
                >
                  <MessageCircle className="w-4 h-4" />
                  Open Inquiry Form
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all"
        style={{ background: '#2563EB', boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}
        animate={open ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Mail className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  );
}
