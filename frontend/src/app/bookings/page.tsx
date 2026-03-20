'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Search, CalendarDays, Users, BadgeCheck, CircleDashed, Ban, Copy, Mail, Phone } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { api, Booking, formatCurrency } from '@/lib/api';

const roomBackdropImages = [
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1616594039964-58e5f4f7b7dd?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=2000&q=80',
];

const statusFilters = ['all', 'confirmed', 'pending', 'received', 'cancelled'] as const;
type StatusFilter = (typeof statusFilters)[number];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searched, setSearched] = useState(false);
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [activeBackdrop, setActiveBackdrop] = useState(0);

  useEffect(() => {
    api.bookings
      .getAll()
      .then((data) => {
        setBookings(data);
        setLoadError('');
        setLoading(false);
      })
      .catch(() => {
        setLoadError('Unable to load bookings right now. Please try again in a moment.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBackdrop((prev) => (prev + 1) % roomBackdropImages.length);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const query = searchEmail.trim().toLowerCase();

    if (!query) {
      setFilteredBookings([]);
      setSearched(false);
      setActiveStatus('all');
      return;
    }

    const results = bookings.filter(
      (b) =>
        b.guestEmail?.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query)
    );

    setFilteredBookings(results);
    setSearched(true);
  };

  const searchedBookings = searched ? filteredBookings : [];
  const displayBookings = searchedBookings
    .filter((booking) => activeStatus === 'all' || booking.status === activeStatus)
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

  const insights = {
    total: searchedBookings.length,
    confirmed: searchedBookings.filter((booking) => booking.status === 'confirmed').length,
    pending: searchedBookings.filter((booking) => booking.status === 'pending').length,
    received: searchedBookings.filter((booking) => booking.status === 'received').length,
    cancelled: searchedBookings.filter((booking) => booking.status === 'cancelled').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35';
      case 'received':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/35';
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/35';
      case 'cancelled':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/35';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getNights = (checkIn: string, checkOut: string) => {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const copyBookingId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <PageTransition>
      <div className="relative isolate overflow-hidden min-h-screen">
        <div className="absolute inset-0 -z-10">
          {roomBackdropImages.map((image, index) => (
            <motion.div
              key={image}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
              animate={{
                opacity: activeBackdrop === index ? 0.42 : 0,
                scale: activeBackdrop === index ? 1.06 : 1,
              }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/78 to-[#050505]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,166,70,0.18),transparent_42%)]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-5xl sm:text-6xl font-light text-gold font-serif italic mb-3">
              My Bookings
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto text-center">
              Search by booking ID or email, review your reservation status, and prepare for your stay.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-dark/75 backdrop-blur-md border border-gold/25 rounded-2xl p-4 sm:p-5 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your email or booking ID"
                className="flex-1 min-h-[52px] bg-dark/80 border border-dark-border rounded-xl px-5 py-4 text-white text-lg sm:text-xl focus:outline-none focus:border-gold transition-colors placeholder:text-gray-500"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="min-h-[52px] bg-gradient-to-r from-gold to-[#d8b761] text-dark font-semibold px-8 py-4 rounded-xl transition-all text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              >
                <Search size={20} />
                Search Reservations
              </motion.button>
            </div>

            <div className="mt-4 text-base sm:text-lg text-gray-400 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span>Tip: use the email used at checkout.</span>
              <span>Reservation IDs can also be searched directly.</span>
            </div>
          </motion.div>

          {loadError && !loading && (
            <div className="mb-6 rounded-xl border border-rose-500/35 bg-rose-500/10 p-4 text-rose-200 text-sm">
              {loadError}
            </div>
          )}

          {!loading && searchedBookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6"
            >
              <div className="rounded-xl border border-dark-border bg-dark/70 backdrop-blur p-4">
                <p className="text-gray-400 text-xs tracking-wider uppercase mb-1">Found</p>
                <p className="text-white text-2xl font-semibold">{insights.total}</p>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <p className="text-emerald-300 text-xs tracking-wider uppercase mb-1">Confirmed</p>
                <p className="text-white text-2xl font-semibold">{insights.confirmed}</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-amber-300 text-xs tracking-wider uppercase mb-1">Pending</p>
                <p className="text-white text-2xl font-semibold">{insights.pending}</p>
              </div>
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
                <p className="text-sky-300 text-xs tracking-wider uppercase mb-1">Received</p>
                <p className="text-white text-2xl font-semibold">{insights.received}</p>
              </div>
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                <p className="text-rose-300 text-xs tracking-wider uppercase mb-1">Cancelled</p>
                <p className="text-white text-2xl font-semibold">{insights.cancelled}</p>
              </div>
            </motion.div>
          )}

          {!loading && searchedBookings.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`min-h-[52px] px-6 py-3 rounded-full border text-base sm:text-lg tracking-wide capitalize transition-colors ${
                    activeStatus === status
                      ? 'border-gold/55 bg-gold/15 text-gold'
                      : 'border-dark-border bg-dark/60 text-gray-300 hover:border-gold/35 hover:text-gold'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-dark/70 backdrop-blur border border-dark-border rounded-xl p-6 animate-pulse"
                >
                  <div className="h-5 bg-dark-border rounded w-1/3 mb-3" />
                  <div className="h-4 bg-dark-border rounded w-1/2 mb-2" />
                  <div className="h-4 bg-dark-border rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {!loading && searched && displayBookings.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-dark/60 backdrop-blur rounded-2xl border border-dark-border"
            >
              <p className="text-gray-300 text-2xl mb-2">No bookings found</p>
              <p className="text-gray-500 text-lg">
                Check your email or booking ID and try again.
              </p>
            </motion.div>
          )}

          {!loading && !searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-dark/60 backdrop-blur rounded-2xl border border-dark-border"
            >
              <p className="text-gray-400 text-xl">
                Enter your email or booking ID above to reveal your reservations.
              </p>
            </motion.div>
          )}

          {!loading && displayBookings.length > 0 && (
            <div className="space-y-4">
              {displayBookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-dark/70 backdrop-blur border border-dark-border rounded-2xl p-5 sm:p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                    <div>
                      <h3 className="text-white font-semibold text-2xl mb-1">
                        {booking.room?.name || 'Luxury Room'}
                      </h3>
                      <p className="text-gold/70 text-xs tracking-[0.2em] uppercase mb-2">
                        {booking.room?.category || 'Room'} · {booking.room?.roomNumber || 'Assigned on arrival'}
                      </p>
                      <p className="text-gray-500 text-base font-mono">Reservation ID: {booking.id}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 w-fit min-h-[44px] px-4 py-2 rounded-full text-base font-medium border capitalize ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status === 'confirmed' && <BadgeCheck size={14} />}
                      {booking.status === 'received' && <BadgeCheck size={14} />}
                      {booking.status === 'pending' && <CircleDashed size={14} />}
                      {booking.status === 'cancelled' && <Ban size={14} />}
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-lg mb-5">
                    <div>
                      <span className="text-gray-400 block text-base mb-1">Check-in</span>
                      <span className="text-white inline-flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-gold" />
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-base mb-1">Check-out</span>
                      <span className="text-white inline-flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-gold" />
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-base mb-1">Length</span>
                      <span className="text-white">{getNights(booking.checkIn, booking.checkOut)} nights</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-base mb-1">Guests</span>
                      <span className="text-white inline-flex items-center gap-1.5">
                        <Users size={14} className="text-gold" />
                        {booking.guests}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-base mb-1">Total</span>
                      <span className="text-gold font-semibold text-xl">{formatCurrency(booking.totalPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-base mb-1">Payment</span>
                      <span className="text-white">
                        {booking.paymentMethod === 'cash_on_arrival' ? 'Cash on arrival' : booking.paymentMethod} · {booking.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-dark-border pt-4">
                    <div className="space-y-1 text-base sm:text-lg text-gray-400">
                      {booking.receivedAt && (
                        <p>
                          Received on {new Date(booking.receivedAt).toLocaleDateString()}
                        </p>
                      )}
                      {booking.guestEmail && (
                        <p className="inline-flex items-center gap-2 mr-4">
                          <Mail size={14} className="text-gold" />
                          {booking.guestEmail}
                        </p>
                      )}
                      {booking.guestPhone && (
                        <p className="inline-flex items-center gap-2">
                          <Phone size={14} className="text-gold" />
                          {booking.guestPhone}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => copyBookingId(booking.id)}
                        className="inline-flex items-center gap-2 min-h-[52px] px-6 py-3 rounded-lg border border-dark-border text-lg text-gray-200 hover:text-gold hover:border-gold/40 transition-colors"
                      >
                        <Copy size={14} />
                        {copiedId === booking.id ? 'Copied' : 'Copy ID'}
                      </button>
                      <Link
                        href={`/rooms/${booking.roomId}`}
                        className="inline-flex items-center gap-2 min-h-[52px] px-6 py-3 rounded-lg border border-gold/40 text-lg text-gold hover:bg-gold/10 transition-colors"
                      >
                        View Room
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
