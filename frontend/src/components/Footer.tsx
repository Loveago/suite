'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-dark-lighter border-t border-dark-border mt-auto w-full">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-10 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-10">
          {/* Brand */}
          <div>
            <motion.h3
              className="mb-4 inline-flex items-center gap-2 text-[1.9rem] sm:text-[2.15rem] font-semibold tracking-[0.28em] text-transparent bg-clip-text bg-gradient-to-r from-[#f6e29a] via-[#c9a646] to-[#8f6b1b] font-serif italic drop-shadow-[0_0_18px_rgba(201,166,70,0.2)]"
              whileHover={{ scale: 1.03, y: -1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <span className="text-gold/70 text-base not-italic tracking-[0.2em]">THE</span>
              <span>SUITE</span>
            </motion.h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Experience luxury redefined. Premium rooms, world-class amenities,
              and an unforgettable stay await you.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:justify-self-center">
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">
              QUICK LINKS
            </h4>
            <div className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/rooms', label: 'Rooms' },
                { href: '/bookings', label: 'Bookings' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-400 text-sm hover:text-gold transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">
              CONTACT
            </h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <p>123 Luxury Avenue</p>
              <p>contact@thesuite.com</p>
              <p>+1 (555) 000-0000</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-dark-border/80 text-center">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} THE SUITE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
