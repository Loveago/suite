'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, CalendarDays, Users, BedDouble, Mail, Phone, Copy, ArrowRight, Home } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import PriceWithUsd from '@/components/PriceWithUsd';
import { api, Booking } from '@/lib/api';

export default function BookingConfirmedClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const bookingId = searchParams.get('bookingId') || '';
  const email = searchParams.get('email') || '';

  useEffect(() => {
    if (!bookingId && !email) {
      router.replace('/');
      return;
    }

    const query = bookingId || email;
    api.bookings
      .search(query)
      .then((results) => {
        const found = bookingId
          ? results.find((b) => b.id === bookingId) || results[0]
          : results[0];
        setBooking(found || null);
      })
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [bookingId, email, router]);

  const copyId = async () => {
    if (!booking) return;
    try {
      await navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  const getNights = (checkIn: string, checkOut: string) =>
    Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-dark flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-2 border-dark-border border-t-gold rounded-full"
            />
            <p className="text-gray-400 text-sm">Loading your reservation…</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/6 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto px-4 py-16 sm:py-24">
          {/* Success badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl scale-150" />
              <div className="relative w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-400/40 flex items-center justify-center">
                <CheckCircle2 size={44} className="text-emerald-400" strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl sm:text-5xl font-light text-gold font-serif italic mb-3">
              Booking Confirmed!
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-md mx-auto">
              Your reservation has been received. We look forward to welcoming you.
            </p>
          </motion.div>

          {booking ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="space-y-4"
            >
              {/* Booking ID card */}
              <div className="bg-dark-card border border-gold/25 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Reservation ID</span>
                  <button
                    onClick={copyId}
                    className="inline-flex items-center gap-1.5 text-xs text-gold/70 hover:text-gold transition-colors"
                  >
                    <Copy size={12} />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-white font-mono text-sm sm:text-base break-all">{booking.id}</p>
                <p className="text-gray-500 text-xs mt-1">Save this ID to look up your booking anytime.</p>
              </div>

              {/* Room + dates */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <BedDouble size={18} className="text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">{booking.room?.name || 'Luxury Room'}</p>
                    <p className="text-gold/70 text-xs uppercase tracking-widest mt-0.5">
                      {booking.room?.category || 'Room'} · {booking.room?.roomNumber || 'Assigned on arrival'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dark-border">
                  <div className="flex items-start gap-2">
                    <CalendarDays size={15} className="text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Check-in</p>
                      <p className="text-white text-sm">{formatDate(booking.checkIn)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays size={15} className="text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Check-out</p>
                      <p className="text-white text-sm">{formatDate(booking.checkOut)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users size={15} className="text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Guests</p>
                      <p className="text-white text-sm">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">Duration</p>
                    <p className="text-white text-sm">{getNights(booking.checkIn, booking.checkOut)} night{getNights(booking.checkIn, booking.checkOut) !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-dark-card border border-dark-border rounded-2xl p-5 sm:p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-gray-500 text-xs">Payable in cash on arrival</p>
                </div>
                <PriceWithUsd
                  amount={booking.totalPrice}
                  className="text-gold text-2xl font-bold"
                  usdClassName="text-gold/70 text-sm font-medium"
                />
              </div>

              {/* Guest info */}
              {(booking.guestEmail || booking.guestPhone) && (
                <div className="bg-dark-card border border-dark-border rounded-2xl p-5 sm:p-6 space-y-2">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Guest Details</p>
                  {booking.guestName && (
                    <p className="text-white text-sm font-medium">{booking.guestName}</p>
                  )}
                  {booking.guestEmail && (
                    <p className="inline-flex items-center gap-2 text-gray-300 text-sm">
                      <Mail size={13} className="text-gold" />
                      {booking.guestEmail}
                    </p>
                  )}
                  {booking.guestPhone && (
                    <p className="inline-flex items-center gap-2 text-gray-300 text-sm">
                      <Phone size={13} className="text-gold" />
                      {booking.guestPhone}
                    </p>
                  )}
                </div>
              )}

              {/* Status note */}
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-amber-200/80 text-sm">
                Your booking status is <span className="font-semibold capitalize text-amber-200">{booking.status}</span>. You will be contacted to confirm your reservation.
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center"
            >
              <p className="text-gray-300 text-lg mb-1">Your booking was placed successfully.</p>
              <p className="text-gray-500 text-sm">Check your email for confirmation details.</p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            <Link
              href="/bookings"
              className="flex-1 flex items-center justify-center gap-2 bg-gold hover:bg-gold-light text-dark font-semibold py-3.5 rounded-xl transition-colors text-sm"
            >
              View My Bookings
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 border border-dark-border text-gray-300 hover:text-white hover:border-gray-500 py-3.5 rounded-xl transition-colors text-sm"
            >
              <Home size={15} />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
