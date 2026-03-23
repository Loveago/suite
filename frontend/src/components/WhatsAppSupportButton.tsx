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
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#25D366] px-4 py-3 text-[#08110c] shadow-[0_18px_40px_rgba(37,211,102,0.28)] transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_22px_50px_rgba(37,211,102,0.34)]">
        <span className="hidden sm:block text-sm font-semibold tracking-[0.08em] uppercase">Chat Support</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18">
          <MessageCircleMore className="h-5 w-5" />
        </span>
      </div>
    </a>
  );
}
