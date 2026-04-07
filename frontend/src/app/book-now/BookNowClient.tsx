'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Calendar, User, Check, BedDouble, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import PriceWithUsd from '@/components/PriceWithUsd';
import { api, defaultSiteSettings, Property, Room, SiteSettings, formatCurrency, getImageUrl } from '@/lib/api';
import { defaultProperties, getAllowedCategoriesForProperty, getCategoryOrderForProperty, getDefaultRoomsForProperty, resolvePropertyFromCollection } from '@/lib/default-room-catalog';
import { useRouter, useSearchParams } from 'next/navigation';

const STEPS = [
  { id: 1, label: 'Room & Dates', icon: Calendar },
  { id: 2, label: 'Your Details', icon: User },
  { id: 3, label: 'Confirm', icon: Check },
];

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

const inputCls =
  'w-full bg-dark border border-dark-border rounded-xl px-4 py-3.5 text-white text-base focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600';

const labelCls = 'block text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2';

const toRoomTypeLabel = (category: string) => (/room|bedroom/i.test(category) ? category : `${category} Room`);

export default function BookNowClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsFetchFailed, setRoomsFetchFailed] = useState(false);
  const [siteSettingsLoaded, setSiteSettingsLoaded] = useState(false);
  const [siteSettingsFetchFailed, setSiteSettingsFetchFailed] = useState(false);
  const [properties, setProperties] = useState<Property[]>(defaultProperties);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numGuests, setNumGuests] = useState(2);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const propertyIdFromQuery = searchParams.get('propertyId') || '';
    const categoryFromQuery = searchParams.get('category') || '';
    const checkInFromQuery = searchParams.get('checkIn') || '';
    const checkOutFromQuery = searchParams.get('checkOut') || '';
    const guestsFromQuery = searchParams.get('guests') || '';

    if (propertyIdFromQuery) {
      setSelectedPropertyId(propertyIdFromQuery);
    }

    if (checkInFromQuery) {
      setCheckIn(checkInFromQuery);
    }

    if (checkOutFromQuery) {
      setCheckOut(checkOutFromQuery);
    }

    if (guestsFromQuery) {
      const parsedGuests = Number(guestsFromQuery);
      if (Number.isFinite(parsedGuests) && parsedGuests > 0) {
        setNumGuests(parsedGuests);
      }
    }

    if (categoryFromQuery) {
      setSelectedCategory(categoryFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    api.properties
      .getAll()
      .then((data) => {
        const nextProperties = data.length ? data : defaultProperties;
        setProperties(nextProperties);
        setSelectedPropertyId((current) => (current ? current : nextProperties[0]?.id || ''));
      })
      .catch(() => {
        setProperties(defaultProperties);
        setSelectedPropertyId((current) => (current ? current : defaultProperties[0].id));
      });

    api.siteSettings
      .get()
      .then((data) => {
        setSiteSettings(data);
        setSiteSettingsFetchFailed(false);
      })
      .catch(() => {
        setSiteSettings(defaultSiteSettings);
        setSiteSettingsFetchFailed(true);
      })
      .finally(() => {
        setSiteSettingsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!selectedPropertyId) {
      setRooms([]);
      setRoomsFetchFailed(false);
      return;
    }

    api.rooms
      .getAll({ propertyId: selectedPropertyId })
      .then((data) => {
        setRooms(data);
        setRoomsFetchFailed(false);
      })
      .catch(() => {
        setRooms(getDefaultRoomsForProperty(selectedPropertyId, properties));
        setRoomsFetchFailed(true);
      });
  }, [selectedPropertyId, properties]);

  useEffect(() => {
    if (searchParams.get('category')) {
      return;
    }
    setSelectedCategory('');
  }, [selectedPropertyId, searchParams]);

  useEffect(() => {
    const resolvedBackgroundImages =
      siteSettings.images.bookNowBackgroundImages.length > 0
        ? siteSettings.images.bookNowBackgroundImages
        : siteSettingsLoaded && siteSettingsFetchFailed
        ? defaultSiteSettings.images.bookNowBackgroundImages
        : [];

    if (resolvedBackgroundImages.length === 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setBackgroundIndex((prev) => (prev + 1) % resolvedBackgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [siteSettings.images.bookNowBackgroundImages, siteSettingsLoaded, siteSettingsFetchFailed]);

  const selectedProperty = resolvePropertyFromCollection(properties, selectedPropertyId);
  const bookingPropertyId = properties.find((property) => property.slug === selectedProperty.slug)?.id || selectedProperty.id;
  const backgroundImages =
    siteSettings.images.bookNowBackgroundImages.length > 0
      ? siteSettings.images.bookNowBackgroundImages
      : siteSettingsLoaded && siteSettingsFetchFailed
      ? defaultSiteSettings.images.bookNowBackgroundImages
      : [];
  const allowedCategories = getAllowedCategoriesForProperty(selectedProperty.slug);
  const visibleRooms = (roomsFetchFailed ? getDefaultRoomsForProperty(selectedPropertyId, properties) : rooms).filter((room) => allowedCategories.includes(room.category));
  const categories = getCategoryOrderForProperty(selectedProperty.slug, visibleRooms.map((room) => room.category));
  const roomsInSelectedCategory = visibleRooms.filter((room) => room.category === selectedCategory);
  const selectedCategoryPrice = roomsInSelectedCategory[0]?.price || 0;
  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  })();
  const totalAmount = nights * selectedCategoryPrice;

  const goNext = () => {
    setError('');
    if (currentStep === 1) {
      if (!selectedCategory || !checkIn || !checkOut) {
        setError('Please select a room category and your dates.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!firstName || !lastName || !email || !phone) {
        setError('Please fill in all required fields.');
        return;
      }
    }
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setError('');
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const booking = await api.bookings.create({
        roomCategory: selectedCategory,
        propertyId: bookingPropertyId,
        checkIn,
        checkOut,
        guestName: `${firstName} ${lastName}`,
        guestEmail: email,
        guestPhone: phone,
        guests: numGuests,
      });
      const params = new URLSearchParams();
      if (booking?.id) params.set('bookingId', booking.id);
      if (email) params.set('email', email);
      router.push(`/booking-confirmed?${params.toString()}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create booking. Please try again.');
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark relative overflow-hidden">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={`${image}-${index}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: backgroundIndex === index ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image.startsWith('http') ? image : getImageUrl(image)})` }}
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-black/72" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gold/6 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/3 rounded-full blur-3xl" />

        <div className="relative max-w-lg lg:max-w-2xl mx-auto px-4 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 text-gold/70 text-xs font-semibold uppercase tracking-widest mb-4 border border-gold/20 px-4 py-1.5 rounded-full bg-gold/5"
            >
              <Sparkles size={12} />
              Luxury Experience
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-light text-gold font-serif italic mb-3">Book Your Stay</h1>
            <p className="text-gray-400 text-sm sm:text-base text-center">Complete your reservation in just a few steps</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center mb-10"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isDone = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      animate={{
                        backgroundColor: isDone ? '#C9A646' : 'rgba(0,0,0,0)',
                        borderColor: isActive || isDone ? '#C9A646' : '#2a2a2a',
                        scale: isActive ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                    >
                      {isDone ? (
                        <Check size={16} className="text-dark" strokeWidth={3} />
                      ) : (
                        <Icon size={16} className={isActive ? 'text-gold' : 'text-gray-600'} />
                      )}
                    </motion.div>
                    <span
                      className={`text-xs font-medium tracking-wide transition-colors ${
                        isActive ? 'text-gold' : isDone ? 'text-gold/60' : 'text-gray-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="mx-3 mb-5 flex items-center">
                      <motion.div
                        animate={{ backgroundColor: isDone ? '#C9A646' : '#2a2a2a' }}
                        transition={{ duration: 0.4 }}
                        className="w-12 sm:w-16 h-0.5 rounded-full"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>

          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8 space-y-6">
                    <div>
                      <label className={labelCls}>Where to?</label>
                      <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} className={inputCls}>
                        {properties.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.name} · {property.city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Room Category</label>
                      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputCls}>
                        <option value="">Select a room category</option>
                        {categories.map((category) => {
                          const categoryRoom = visibleRooms.find((room) => room.category === category);
                          return (
                            <option key={category} value={category}>
                              {toRoomTypeLabel(category)} — {categoryRoom ? `${formatCurrency(categoryRoom.price)}/night` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {selectedCategory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gold/20 bg-gold/5"
                      >
                        <BedDouble size={18} className="text-gold flex-shrink-0" />
                        <div>
                          <p className="text-gold text-sm font-semibold">{selectedCategory} · Automatic room assignment</p>
                          <p className="text-gray-400 text-xs">{formatCurrency(selectedCategoryPrice)} per night</p>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>
                          Check-in <span className="text-gold normal-case tracking-normal">*</span>
                        </label>
                        <input
                          type="date"
                          value={checkIn}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Check-out <span className="text-gold normal-case tracking-normal">*</span>
                        </label>
                        <input
                          type="date"
                          value={checkOut}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {nights > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-2 text-gold/80 text-sm font-medium"
                      >
                        {nights} night{nights !== 1 ? 's' : ''}
                        {selectedCategory ? ' · ' : ''}
                        {selectedCategory ? (
                          <PriceWithUsd amount={totalAmount} className="text-gold/80" usdClassName="text-gold/60" suffix=" total" />
                        ) : null}
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Guests</label>
                        <select value={numGuests} onChange={(e) => setNumGuests(Number(e.target.value))} className={inputCls}>
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? 'Guest' : 'Guests'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="rounded-xl border border-dark-border bg-dark/40 px-4 py-3.5 text-left">
                        <span className="block text-[11px] text-gray-500 font-semibold uppercase tracking-widest mb-1">Assignment</span>
                        <span className="text-white text-sm">1 room will be assigned</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8 space-y-5 text-center">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>
                          First Name <span className="text-gold normal-case tracking-normal">*</span>
                        </label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Last Name <span className="text-gold normal-case tracking-normal">*</span>
                        </label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Email Address <span className="text-gold normal-case tracking-normal">*</span>
                      </label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Phone Number <span className="text-gold normal-case tracking-normal">*</span>
                      </label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Special Requests <span className="text-gray-600 normal-case tracking-normal text-xs">(Optional)</span>
                      </label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={3}
                        placeholder="Any special requests or requirements..."
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="bg-dark-card border border-gold/25 rounded-2xl p-6 sm:p-8">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/30 mb-3">
                        <Sparkles size={22} className="text-gold" />
                      </div>
                      <h3 className="text-xl font-light text-white">Reservation Summary</h3>
                    </div>

                    <div className="space-y-3 mb-6">
                      {[
                        { label: 'Property', value: `${selectedProperty.name} · ${selectedProperty.city}` },
                        { label: 'Room Type', value: selectedCategory || '—' },
                        { label: 'Room Number', value: 'Assigned automatically after availability check' },
                        { label: 'Check-in', value: formatDate(checkIn) },
                        { label: 'Check-out', value: formatDate(checkOut) },
                        { label: 'Duration', value: `${nights} night${nights !== 1 ? 's' : ''}` },
                        { label: 'Guests', value: `${numGuests} guest${numGuests !== 1 ? 's' : ''}` },
                        { label: 'Assignment', value: 'Automatic available room assignment' },
                        { label: 'Guest Name', value: `${firstName} ${lastName}`.trim() || '—' },
                        { label: 'Email', value: email || '—' },
                        { label: 'Phone', value: phone || '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-2 border-b border-dark-border/60 last:border-0">
                          <span className="text-gray-500 text-sm">{label}</span>
                          <span className="text-white text-sm font-medium text-right max-w-[55%] truncate">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-gold/8 border border-gold/25 p-4 flex items-center justify-between mb-6">
                      <span className="text-gray-300 font-medium">Total Amount</span>
                      <PriceWithUsd
                        amount={totalAmount}
                        className="text-gold text-2xl font-bold"
                        usdClassName="text-gold/80 text-base font-medium"
                      />
                    </div>

                    <p className="text-gray-500 text-xs text-center mb-5">
                      Payment is collected in cash on arrival. By proceeding, you confirm your reservation details.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/8 text-rose-300 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3 mt-6"
          >
            {currentStep > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-dark-border text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium"
              >
                <ChevronLeft size={16} />
                Back
              </motion.button>
            )}

            {currentStep < 3 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-[#d4b85c] text-dark font-bold py-3.5 rounded-xl text-base shadow-[0_8px_24px_rgba(201,166,70,0.25)] hover:brightness-105 transition-all"
              >
                Continue
                <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.97 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-[#d4b85c] text-dark font-bold py-3.5 rounded-xl text-base shadow-[0_8px_24px_rgba(201,166,70,0.25)] hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full"
                  />
                ) : (
                  <>
                    <Check size={16} />
                    Confirm Booking
                  </>
                )}
              </motion.button>
            )}
          </motion.div>

          <p className="text-center text-gray-600 text-xs mt-4">Step {currentStep} of {STEPS.length}</p>
        </div>
      </div>
    </PageTransition>
  );
}
