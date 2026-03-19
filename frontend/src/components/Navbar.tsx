'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Clock3, Phone, MapPin, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/book-now', label: 'Book Now' },
  { href: '/bookings', label: 'Bookings' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch('/api/admin/status', { cache: 'no-store' });
        const data = await res.json();
        setIsAdminAuthenticated(Boolean(data.authenticated));
      } catch {
        setIsAdminAuthenticated(false);
      }
    };

    checkAdminStatus();
  }, [pathname]);

  const visibleNavLinks = isAdminAuthenticated
    ? [...navLinks, { href: '/admin', label: 'Admin' }]
    : navLinks;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const mobileDrawer = mounted
    ? createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div className="fixed inset-0 z-[120] md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-black/65 backdrop-blur-[1px]"
                onClick={() => setMobileOpen(false)}
              />

              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-0 h-dvh w-[90vw] max-w-[420px] bg-gradient-to-b from-[#121212] via-[#0f0f0f] to-[#0b0b0b] border-l border-gold/30 shadow-[-10px_0_40px_rgba(0,0,0,0.45)] p-6 overflow-y-auto"
              >
                <div className="min-h-full flex flex-col">
                  <div className="flex items-center justify-between mb-7">
                    <img src="/logo.jpg" alt="THE SUITE" className="h-9 w-auto object-contain" />
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="w-11 h-11 rounded-xl border border-gold/35 bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/15 transition-colors"
                      aria-label="Close navigation menu"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {visibleNavLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center justify-between rounded-xl px-4 py-4 text-base tracking-[0.08em] border transition-all duration-300 ${
                          pathname === link.href
                            ? 'text-gold border-gold/55 bg-gold/12 shadow-[0_0_0_1px_rgba(201,166,70,0.2),0_12px_28px_rgba(0,0,0,0.35)]'
                            : 'text-gray-100 border-dark-border bg-white/[0.02] hover:border-gold/40 hover:text-gold hover:bg-gold/8'
                        }`}
                      >
                        <span className="font-medium">{link.label}</span>
                        <span className="w-7 h-7 rounded-full border border-current/35 flex items-center justify-center opacity-85 group-hover:opacity-100">
                          <ChevronRight size={15} />
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto pt-8 space-y-4">
                    <div className="rounded-xl border border-dark-border bg-dark-card/75 p-5">
                      <p className="text-gold text-sm tracking-[0.18em] mb-4">STAY ESSENTIALS</p>
                      <div className="space-y-3 text-base">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock3 size={17} className="text-gold" />
                          Check-in from 3:00 PM
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock3 size={17} className="text-gold" />
                          Check-out by 11:00 AM
                        </div>
                        <div className="flex items-start gap-2 text-gray-300">
                          <MapPin size={17} className="text-gold mt-1" />
                          123 Luxury Avenue, City Center
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-dark-border bg-dark-card/75 p-5">
                      <p className="text-gold text-sm tracking-[0.18em] mb-4">CONCIERGE</p>
                      <p className="text-gray-300 text-base mb-4">24/7 assistance for reservations, transport, and special requests.</p>
                      <a
                        href="tel:+15550000000"
                        className="inline-flex items-center gap-2 text-lg text-gold hover:text-gold-light transition-colors"
                      >
                        <Phone size={18} />
                        +1 (555) 000-0000
                      </a>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/85 backdrop-blur-xl border-b border-dark-border">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <img
                src="/logo.jpg"
                alt="THE SUITE"
                className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_0_8px_rgba(201,166,70,0.4)]"
              />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3">
            {visibleNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group"
              >
                <span
                  className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm tracking-[0.14em] uppercase border transition-all duration-300 ${
                    pathname === link.href
                      ? 'text-gold border-gold/50 bg-gold/10 shadow-[0_10px_24px_rgba(0,0,0,0.3)]'
                      : 'text-gray-200 border-dark-border bg-white/[0.02] hover:text-gold hover:border-gold/45 hover:bg-gold/8'
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gold p-2.5 rounded-lg border border-gold/35 bg-dark-card/60"
            aria-label="Open navigation menu"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </motion.div>
      </nav>
      {mobileDrawer}
    </>
  );
}
