'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Calendar,
  User,
  CheckCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Waves,
  UtensilsCrossed,
  Dumbbell,
  CarFront,
  Star,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { api, defaultSiteSettings, Property, Room, SiteSettings, formatCurrency, getImageUrl } from '@/lib/api';
import { defaultProperties, getDefaultRoomsForProperty } from '@/lib/default-room-catalog';
import { useBookingStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6 },
};

const roomImageFallbacks: Record<string, string> = {
  'royal suite': 'https://images.unsplash.com/photo-1590490360182-c33d955c4644?w=1200&q=80',
  'ocean view room': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
  'penthouse loft': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
  'garden retreat': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80',
  'executive suite': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80',
  'honeymoon suite': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
};

const placeholderRooms = [
  {
    id: '1',
    name: 'Royal Suite',
    price: 350,
    images: ['https://images.unsplash.com/photo-1590490360182-c33d955c4644?w=800&q=80'],
  },
  {
    id: '2',
    name: 'Ocean View Room',
    price: 280,
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
  },
  {
    id: '3',
    name: 'Penthouse Loft',
    price: 450,
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'],
  },
];

const luxuryHighlights = [
  {
    icon: ShieldCheck,
    title: 'Private & Secure',
    description: 'Discreet check-in, 24/7 security, and private-floor access for complete peace of mind.',
  },
  {
    icon: Waves,
    title: 'Signature Wellness',
    description: 'Spa rituals, hydrotherapy experiences, and curated in-room recovery amenities.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Chef Curated Dining',
    description: 'Seasonal tasting menus and in-suite dining prepared by our executive culinary team.',
  },
  {
    icon: Dumbbell,
    title: 'Premium Facilities',
    description: 'State-of-the-art fitness, skyline lounge, and tranquil relaxation spaces.',
  },
  {
    icon: CarFront,
    title: 'Chauffeur Service',
    description: 'Luxury airport transfers and city mobility arranged by concierge anytime.',
  },
  {
    icon: Sparkles,
    title: 'Personal Concierge',
    description: 'Every stay is tailored to your preferences, from scent profile to evening turndown.',
  },
];

const guestStories = [
  {
    quote: 'Every detail felt intentional. The room, the scent, the service — exceptional from start to finish.',
    guest: 'Amelia R.',
  },
  {
    quote: 'The most seamless luxury booking experience I have had. Elegant, fast, and beautifully designed.',
    guest: 'Daniel M.',
  },
  {
    quote: 'THE SUITE blends comfort and prestige perfectly. You feel the quality in every touchpoint.',
    guest: 'Noah K.',
  },
];

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>(defaultProperties);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const { setDates, setGuests: setStoreGuests } = useBookingStore();
  const router = useRouter();

  useEffect(() => {
    api.properties.getAll().then((data) => {
      if (data.length > 0) {
        setProperties(data);
        setSelectedPropertyId((current) => (current ? current : data[0].id));
      }
    }).catch(() => setProperties(defaultProperties));

    api.rooms.getAll().then(setRooms).catch(() => setRooms([]));
    api.siteSettings.get().then(setSiteSettings).catch(() => setSiteSettings(defaultSiteSettings));
  }, []);

  useEffect(() => {
    const heroImages = siteSettings.images.homeHeroImages.length > 0 ? siteSettings.images.homeHeroImages : defaultSiteSettings.images.homeHeroImages;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [siteSettings.images.homeHeroImages]);

  const selectedProperty = properties.find((property) => property.id === selectedPropertyId) || properties[0] || defaultProperties[0];
  const propertyRooms = rooms.filter((room) => room.propertyId === selectedPropertyId);
  const fallbackPropertyRooms = getDefaultRoomsForProperty(selectedPropertyId || selectedProperty.id, properties);
  const displayRooms = (rooms.length > 0 ? (propertyRooms.length > 0 ? propertyRooms : rooms) : fallbackPropertyRooms).slice(0, 3);
  const heroImages = siteSettings.images.homeHeroImages.length > 0 ? siteSettings.images.homeHeroImages : defaultSiteSettings.images.homeHeroImages;
  const luxuryCtaImage = siteSettings.images.homeLuxuryCtaImage || defaultSiteSettings.images.homeLuxuryCtaImage;
  const heroImageUrls = heroImages.map((image) => (image.startsWith('http') ? image : getImageUrl(image)));

  const handleSearch = () => {
    if (checkIn) setDates(checkIn, checkOut);
    if (guests) setStoreGuests(guests);
    const searchParams = new URLSearchParams();
    if (selectedPropertyId) {
      searchParams.set('propertyId', selectedPropertyId);
    }
    router.push(`/rooms${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  };

  const getRoomImageLayer = (room: Room | typeof placeholderRooms[0], index: number) => {
    const fallbackByName = roomImageFallbacks[room.name.toLowerCase()];
    const fallback = fallbackByName || placeholderRooms[index % placeholderRooms.length].images[0];

    if (room.images && room.images.length > 0) {
      const primary = room.images[0].startsWith('http') ? room.images[0] : getImageUrl(room.images[0]);
      return `url("${primary}"), url("${fallback}")`;
    }

    return `url("${fallback}")`;
  };

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative min-h-[78vh] sm:min-h-[88vh] overflow-hidden">
        {heroImageUrls.map((img, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: heroIndex === i ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center scale-[1.02]"
              style={{ backgroundImage: `url(${img})` }}
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-black/78 via-black/48 to-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,166,70,0.16),transparent_38%)]" />
        
        <div className="relative z-10 flex min-h-[78vh] sm:min-h-[88vh] flex-col items-center justify-center px-4 pb-10 pt-16 sm:pb-14 sm:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center max-w-5xl"
          >
            <p className="mb-4 inline-flex items-center rounded-full border border-gold/35 bg-black/25 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-gold/90 backdrop-blur-md">
              {siteSettings.general.siteTagline}
            </p>
            <h1 className="text-[clamp(3rem,7vw,6.4rem)] font-light text-white mb-1 leading-[0.92] tracking-[-0.04em] drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
              {siteSettings.general.homeHeroPrimaryText}{' '}
              <span className="italic font-serif text-gold-light">{siteSettings.general.homeHeroHighlightText}</span>
            </h1>
            <h2 className="text-[clamp(2.2rem,5vw,4.8rem)] font-light text-white tracking-[-0.03em]">
              {siteSettings.general.homeHeroSecondaryText.split('THE SUITE')[0] || ''}{' '}
              <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text font-bold tracking-[0.14em] text-transparent">
                {siteSettings.general.siteTitle}
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-200/85 sm:text-base">
              {siteSettings.general.homeHeroDescription}
            </p>
          </motion.div>

          {/* Booking Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 w-full max-w-6xl"
          >
            <div className="overflow-hidden rounded-[28px] border border-gold/30 bg-[linear-gradient(180deg,rgba(18,18,18,0.92),rgba(10,10,10,0.96))] p-3 sm:p-4 shadow-[0_28px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">Luxury Reservation</p>
                  <p className="mt-1 text-sm text-gray-300">Choose your property, dates, and guests to explore the right rooms instantly.</p>
                </div>
                <div className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200">
                  {siteSettings.general.homeBookingBadge}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_1fr_0.8fr_auto] gap-3">
                <div className="relative">
                  <label className="block text-[11px] text-gold/80 mb-1 tracking-[0.16em]">WHERE TO?</label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full h-14 bg-white/[0.03] border border-gold/20 rounded-2xl px-4 pr-11 text-white text-sm shadow-inner shadow-black/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 transition-all appearance-none cursor-pointer"
                  >
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.city} - {property.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 bottom-3.5 w-4 h-4 text-gold/70 pointer-events-none" />
                </div>
                <div className="relative">
                  <label className="block text-[11px] text-gold/80 mb-1 tracking-[0.16em]">CHECK IN</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="luxury-date-input w-full h-14 bg-white/[0.03] border border-gold/20 rounded-2xl px-4 text-white text-sm shadow-inner shadow-black/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 transition-all"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[11px] text-gold/80 mb-1 tracking-[0.16em]">CHECK OUT</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="luxury-date-input w-full h-14 bg-white/[0.03] border border-gold/20 rounded-2xl px-4 text-white text-sm shadow-inner shadow-black/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 transition-all"
                  />
                </div>
                <div className="relative">
                  <label className="block text-[11px] text-gold/80 mb-1 tracking-[0.16em]">GUESTS</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full h-14 bg-white/[0.03] border border-gold/20 rounded-2xl px-4 pr-11 text-white text-sm shadow-inner shadow-black/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/25 transition-all appearance-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 bottom-3.5 w-4 h-4 text-gold/70 pointer-events-none" />
                </div>
                <div className="flex items-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSearch}
                    className="w-full md:w-44 h-14 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-dark font-semibold transition-all duration-300 text-sm tracking-[0.14em] uppercase shadow-[0_14px_34px_rgba(201,166,70,0.28)] hover:brightness-105"
                  >
                    Search
                  </motion.button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-300">
                {[selectedProperty ? `${selectedProperty.name} · ${selectedProperty.city}` : 'Luxury destination', 'Free cancellation within 24h', 'Concierge included', 'Curated luxury stays'].map((note) => (
                  <span key={note} className="inline-flex items-center rounded-full border border-gold/20 bg-white/[0.03] px-3 py-1.5">
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-gold mb-3 font-serif italic">
              Explore Our Luxury Rooms
            </h2>
            <p className="text-gray-400 text-sm tracking-wide">
              {selectedProperty ? `${selectedProperty.name} in ${selectedProperty.city}` : 'Handpicked for Your Perfect Stay'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayRooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <Link href={rooms.length > 0 ? `/rooms/${room.id}` : '/rooms'}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="bg-dark-card border border-dark-border rounded-xl overflow-hidden group cursor-pointer"
                  >
                    <div className="relative h-56 sm:h-64 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: getRoomImageLayer(room, i) }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white mb-1">{room.name}</h3>
                      <p className="text-gold text-sm mb-4">
                        From {formatCurrency(room.price)} / Night
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-block bg-gold/10 border border-gold text-gold text-xs font-medium px-4 py-2 rounded-lg hover:bg-gold hover:text-dark transition-all duration-300"
                      >
                        View Details
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Highlights */}
      <section className="py-16 sm:py-20 bg-dark-lighter/70 border-y border-dark-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-gold mb-3 font-serif italic">
              Crafted for Elevated Stays
            </h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
              Beyond rooms — THE SUITE offers a complete luxury ecosystem designed for comfort, privacy, and elegance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {luxuryHighlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                whileHover={{ y: -5 }}
                className="rounded-xl border border-dark-border bg-dark/70 p-5 sm:p-6"
              >
                <div className="w-10 h-10 rounded-lg border border-gold/45 bg-gold/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Steps */}
      <section className="py-14 sm:py-20 lg:py-24 bg-dark-lighter border-y border-dark-border/70 w-full">
        <div className="w-full px-4 sm:px-8 lg:px-14 xl:px-20 2xl:px-24">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-14">
            <h2 className="text-[clamp(2rem,3.2vw,3rem)] font-light text-gold mb-2 sm:mb-3 font-serif italic leading-tight">
              Book Your Stay in Seconds
            </h2>
            <p className="text-gray-400 text-sm sm:text-base tracking-wide">
              Easy & Fast Booking Process
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-7 sm:gap-8 lg:gap-12 relative w-full max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-10 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" />

            {[
              { icon: Calendar, title: '1. Select Dates', desc: 'Choose your check-in and check-out dates' },
              { icon: User, title: '2. Enter Your Details', desc: 'Provide your contact information' },
              { icon: CheckCircle, title: '3. Confirm & Enjoy', desc: 'Confirm your booking and enjoy your stay' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="flex flex-col items-center text-center relative z-10 px-3 sm:px-4 lg:px-6 w-full sm:w-auto sm:flex-1"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 mb-4 rounded-full border-2 border-gold/90 bg-dark shadow-[0_0_0_6px_rgba(201,166,70,0.10)] flex items-center justify-center"
                >
                  <step.icon className="w-8 h-8 text-gold" />
                </motion.div>
                <h3 className="text-white font-semibold mb-2 text-lg">{step.title}</h3>
                <p className="text-gray-400 text-sm sm:text-[15px] leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-0">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-y border-dark-border">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="h-72 sm:h-80 lg:h-[420px]"
            >
              <div
                className="h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${luxuryCtaImage.startsWith('http') ? luxuryCtaImage : getImageUrl(luxuryCtaImage)})`,
                }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-dark-card p-8 sm:p-10 lg:p-16 xl:p-20 flex flex-col justify-center"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gold mb-4 sm:mb-5 font-serif italic leading-tight">
                {siteSettings.general.homeCtaTitle}
              </h2>
              <p className="text-gray-300 leading-relaxed mb-7 sm:mb-8 max-w-xl text-base sm:text-lg">
                {siteSettings.general.homeCtaDescription}
              </p>
              <Link href="/rooms">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gold hover:bg-gold-light text-dark font-semibold px-8 py-3 rounded-lg transition-colors duration-300 text-sm tracking-wide"
                >
                  Browse Rooms
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guest Stories */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-gold mb-3 font-serif italic">
              Words from Our Guests
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">A glimpse into the experience that keeps guests returning.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {guestStories.map((story, i) => (
              <motion.article
                key={story.guest}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="rounded-xl border border-dark-border bg-dark-card p-5 sm:p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-4">“{story.quote}”</p>
                <p className="text-gold text-sm font-medium">{story.guest}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
