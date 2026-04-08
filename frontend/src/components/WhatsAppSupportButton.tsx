'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircleMore, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const properties = [
  {
    label: 'The Suite',
    sublabel: 'Clementine street, Tema',
    whatsapp: '233507913323',
    message: 'Hello The Suite, I need help with my booking.',
  },
  {
    label: 'Kingstel Escape',
    sublabel: '21 Nii Teiko Abbey Ln, Accra',
    whatsapp: '233539541143',
    message: 'Hello Kingstel Escape, I need help with my booking.',
  },
];

export default function WhatsAppSupportButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (property: (typeof properties)[number]) => {
    const url = `https://wa.me/${property.whatsapp}?text=${encodeURIComponent(property.message)}`;
    window.open(url, '_blank', 'noreferrer');
    setOpen(false);
  };

  return (
    <div ref={ref} className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[70] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-64 rounded-2xl border border-gold/30 bg-[linear-gradient(145deg,rgba(18,18,18,0.98),rgba(10,10,10,0.99))] shadow-[0_24px_56px_rgba(0,0,0,0.7)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border/60">
              <p className="text-white text-xs font-semibold uppercase tracking-widest">Who would you like to contact?</p>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {properties.map((property) => (
                <button
                  key={property.label}
                  onClick={() => handleSelect(property)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gold/10 transition-colors group text-left"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/8 text-gold group-hover:bg-gold/18 transition-colors">
                    <MessageCircleMore size={16} />
                  </span>
                  <div>
                    <p className="text-white text-sm font-semibold">{property.label}</p>
                    <p className="text-gray-500 text-xs">{property.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat Support"
        className="group"
      >
        <div className="luxury-support-pulse flex items-center gap-3 rounded-full border border-gold/35 bg-[linear-gradient(135deg,rgba(18,18,18,0.96),rgba(10,10,10,0.98))] px-4 py-3 text-gold shadow-[0_18px_42px_rgba(201,166,70,0.22)] transition-all duration-300 group-hover:scale-[1.03] group-hover:border-gold/55 group-hover:shadow-[0_24px_52px_rgba(201,166,70,0.3)]">
          <span className="hidden sm:block text-sm font-semibold tracking-[0.14em] uppercase">Chat Support</span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/12 text-gold-light">
            <MessageCircleMore className="h-5 w-5" />
          </span>
        </div>
      </button>
    </div>
  );
}
