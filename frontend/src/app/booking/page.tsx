'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle, ArrowLeft, ArrowRight, Calendar, User, CreditCard } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import PriceWithUsd from '@/components/PriceWithUsd';
import { useBookingStore } from '@/lib/store';
import { api, formatCurrency } from '@/lib/api';

const steps = [
  { id: 1, label: 'Dates', icon: Calendar },
  { id: 2, label: 'Details', icon: User },
  { id: 3, label: 'Confirm', icon: CreditCard },
];

export default function BookingPage() {
  const router = useRouter();
  const store = useBookingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (!store.roomId) {
      router.push('/rooms');
    }
  }, [store.roomId, router]);

  const canProceedStep1 = store.checkIn && store.checkOut && store.getNights() > 0;
  const canProceedStep2 = store.guestName && store.guestEmail;

  const handleNext = () => {
    if (store.step === 1 && canProceedStep1) {
      store.setStep(2);
    } else if (store.step === 2 && canProceedStep2) {
      store.setStep(3);
    }
  };

  const handleBack = () => {
    if (store.step > 1) {
      store.setStep(store.step - 1);
    }
  };

  const handleConfirm = async () => {
    if (!store.roomId) return;
    setIsSubmitting(true);
    setError('');

    try {
      const booking = await api.bookings.create({
        roomId: store.roomId,
        checkIn: store.checkIn,
        checkOut: store.checkOut,
        guestName: store.guestName,
        guestEmail: store.guestEmail,
        guestPhone: store.guestPhone,
        guests: store.guests,
        paymentMethod: store.paymentMethod,
      });
      setBookingId(booking.id);
      setBookingComplete(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Booking failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewBooking = () => {
    store.reset();
    router.push('/rooms');
  };

  if (!store.roomId) return null;

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-light text-gold font-serif italic text-center mb-2">
            {bookingComplete ? 'Booking Confirmed!' : 'Complete Your Booking'}
          </h1>
          {bookingComplete ? (
            <p className="text-gray-400 text-center text-sm mb-10">Your reservation has been confirmed.</p>
          ) : (
            <div className="text-center text-sm text-gray-400 mb-10">
              <span>{`Booking: ${store.roomName} — `}</span>
              <PriceWithUsd amount={store.roomPrice || 0} className="text-gray-300" usdClassName="text-gold/80" suffix="/night" />
            </div>
          )}
        </motion.div>

        {/* Success State */}
        {bookingComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-card border border-dark-border rounded-xl p-8 sm:p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>
            <h2 className="text-2xl text-white font-semibold mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-6">Your booking has been confirmed successfully.</p>
            <div className="bg-dark rounded-lg p-4 mb-6 text-left max-w-sm mx-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booking ID</span>
                <span className="text-white font-mono text-xs">{bookingId.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Room</span>
                <span className="text-white">{store.roomName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Check-in</span>
                <span className="text-white">{store.checkIn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Check-out</span>
                <span className="text-white">{store.checkOut}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payment</span>
                <span className="text-white">Cash on arrival</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-dark-border">
                <span className="text-white">Total</span>
                <PriceWithUsd amount={store.getTotalPrice()} className="text-gold" usdClassName="text-gold/80" />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewBooking}
              className="bg-gold hover:bg-gold-light text-dark font-semibold px-8 py-3 rounded-lg transition-colors text-sm"
            >
              Book Another Room
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-10">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <motion.div
                    animate={{
                      scale: store.step === s.id ? 1.1 : 1,
                      backgroundColor:
                        store.step >= s.id ? '#C9A646' : '#1a1a1a',
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-dark-border"
                  >
                    <s.icon
                      size={16}
                      className={store.step >= s.id ? 'text-dark' : 'text-gray-500'}
                    />
                  </motion.div>
                  <span
                    className={`ml-2 text-xs hidden sm:block ${
                      store.step >= s.id ? 'text-gold' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-20 h-px mx-3 ${
                        store.step > s.id ? 'bg-gold' : 'bg-dark-border'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {store.step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8"
                >
                  <h2 className="text-xl text-white font-semibold mb-6">Select Your Dates</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 tracking-wide">CHECK IN</label>
                      <input
                        type="date"
                        value={store.checkIn}
                        onChange={(e) => store.setDates(e.target.value, store.checkOut)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 tracking-wide">CHECK OUT</label>
                      <input
                        type="date"
                        value={store.checkOut}
                        onChange={(e) => store.setDates(store.checkIn, e.target.value)}
                        min={store.checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs text-gray-400 mb-1 tracking-wide">GUESTS</label>
                    <select
                      value={store.guests}
                      onChange={(e) => store.setGuests(Number(e.target.value))}
                      className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {store.getNights() > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-dark rounded-lg p-4 mb-4"
                    >
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">
                          {formatCurrency(store.roomPrice || 0)} x {store.getNights()} night{store.getNights() > 1 ? 's' : ''}
                        </span>
                        <PriceWithUsd amount={store.getTotalPrice()} className="text-white" usdClassName="text-gray-400" />
                      </div>
                      <div className="flex justify-between text-lg font-semibold pt-2 border-t border-dark-border">
                        <span className="text-white">Total</span>
                        <PriceWithUsd amount={store.getTotalPrice()} className="text-gold" usdClassName="text-gold/80" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {store.step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8"
                >
                  <h2 className="text-xl text-white font-semibold mb-6">Enter Your Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 tracking-wide">FULL NAME *</label>
                      <input
                        type="text"
                        value={store.guestName}
                        onChange={(e) =>
                          store.setGuestDetails(e.target.value, store.guestEmail, store.guestPhone)
                        }
                        placeholder="John Doe"
                        className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 tracking-wide">EMAIL *</label>
                      <input
                        type="email"
                        value={store.guestEmail}
                        onChange={(e) =>
                          store.setGuestDetails(store.guestName, e.target.value, store.guestPhone)
                        }
                        placeholder="john@example.com"
                        className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 tracking-wide">PHONE (OPTIONAL)</label>
                      <input
                        type="tel"
                        value={store.guestPhone}
                        onChange={(e) =>
                          store.setGuestDetails(store.guestName, store.guestEmail, e.target.value)
                        }
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1 tracking-wide">PAYMENT</label>
                      <select
                        value={store.paymentMethod}
                        onChange={(e) => store.setPaymentMethod(e.target.value)}
                        className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors cursor-pointer"
                      >
                        <option value="cash_on_arrival">Cash on arrival</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {store.step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="bg-dark-card border border-dark-border rounded-xl p-6 sm:p-8"
                >
                  <h2 className="text-xl text-white font-semibold mb-6">Confirm Your Booking</h2>
                  <div className="space-y-4">
                    <div className="bg-dark rounded-lg p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Room</span>
                        <span className="text-white">{store.roomName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Check-in</span>
                        <span className="text-white">{store.checkIn}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Check-out</span>
                        <span className="text-white">{store.checkOut}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Guests</span>
                        <span className="text-white">{store.guests}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Guest Name</span>
                        <span className="text-white">{store.guestName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Email</span>
                        <span className="text-white">{store.guestEmail}</span>
                      </div>
                      {store.guestPhone && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Phone</span>
                          <span className="text-white">{store.guestPhone}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Payment</span>
                        <span className="text-white">{store.paymentMethod === 'cash_on_arrival' ? 'Cash on arrival' : store.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Nights</span>
                        <span className="text-white">{store.getNights()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold pt-3 border-t border-dark-border">
                        <span className="text-white">Total</span>
                        <span className="text-gold">{formatCurrency(store.getTotalPrice())}</span>
                      </div>
                    </div>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-400 text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                disabled={store.step === 1}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-colors ${
                  store.step === 1
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:text-gold border border-dark-border hover:border-gold'
                }`}
              >
                <ArrowLeft size={16} />
                Back
              </motion.button>

              {store.step < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  disabled={
                    (store.step === 1 && !canProceedStep1) ||
                    (store.step === 2 && !canProceedStep2)
                  }
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    (store.step === 1 && !canProceedStep1) ||
                    (store.step === 2 && !canProceedStep2)
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gold hover:bg-gold-light text-dark'
                  }`}
                >
                  Next
                  <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-light text-dark font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full"
                    />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
