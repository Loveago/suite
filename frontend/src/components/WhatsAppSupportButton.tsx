'use client';

import { MessageCircleMore } from 'lucide-react';

const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233XXXXXXXXX').replace(/\D/g, '');
const whatsappMessage = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || 'Hello THE SUITE, I need help with my booking.';

export default function WhatsAppSupportButton() {
  const href = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : '#';

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with THE SUITE on WhatsApp"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[70] group"
    >
      <div className="luxury-support-pulse flex items-center gap-3 rounded-full border border-gold/35 bg-[linear-gradient(135deg,rgba(18,18,18,0.96),rgba(10,10,10,0.98))] px-4 py-3 text-gold shadow-[0_18px_42px_rgba(201,166,70,0.22)] transition-all duration-300 group-hover:scale-[1.03] group-hover:border-gold/55 group-hover:shadow-[0_24px_52px_rgba(201,166,70,0.3)]">
        <span className="hidden sm:block text-sm font-semibold tracking-[0.14em] uppercase">Chat Support</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/12 text-gold-light">
          <MessageCircleMore className="h-5 w-5" />
        </span>
      </div>
    </a>
  );
}
