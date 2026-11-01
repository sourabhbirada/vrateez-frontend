'use client';

import { MessageCircle } from 'lucide-react';
import { useSettings, whatsappLink } from '@/context/SettingsContext';

const CHAT_WHATSAPP = '916375010189';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const href =
    whatsappLink(settings?.contact?.whatsapp) ||
    whatsappLink(CHAT_WHATSAPP) ||
    `https://wa.me/${CHAT_WHATSAPP}?text=${encodeURIComponent("Hi Vrateez! I'd like to know more about your products.")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-20 right-4 z-40 flex items-center sm:right-6 lg:bottom-6 focus:outline-none"
      aria-label="Chat with us on WhatsApp"
    >
      {/* Tooltip */}
      <span
        className="pointer-events-none mr-3 hidden translate-x-1 whitespace-nowrap rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-parchment opacity-0 shadow-lg ring-1 ring-parchment/10 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:inline-block"
        role="tooltip"
      >
        Chat with us
      </span>

      <span className="relative">
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-25 animate-ping" aria-hidden="true" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-14px_rgba(37,211,102,0.75)] ring-4 ring-parchment/80 transition-all duration-200 group-hover:scale-105 group-hover:bg-[#1EBE5A] group-focus-visible:ring-turmeric/50">
          <MessageCircle size={26} fill="currentColor" strokeWidth={1.5} />
        </span>
      </span>
    </a>
  );
}
