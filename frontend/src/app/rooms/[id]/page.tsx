'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { api, Room, formatCurrency, getImageUrl } from '@/lib/api';
import { defaultRooms } from '@/lib/default-room-catalog';
import { useBookingStore } from '@/lib/store';

const roomItemsByCategory: Record<string, string[]> = {
  Small: [
    'Air conditioning',
    'Double size bed',
    '1 tea cup',
    '1 saucer',
    '2 bowls',
    '1 serving plate',
    '1 medium plate',
    '1 big cup',
    '2 old fashioned glasses',
    '2 wine glasses',
    '2 champagne glasses',
    '2 forks',
    '2 spoons',
    '2 knives',
    '2 tea spoons',
    '1 saucepan',
    '1 chopping board',
    '1 napkin',
    '1 kettle',
    '1 blender',
    '1 hotplate',
    '1 microwave',
    '1 bedside lamp',
    'Fridge',
    '1 corkscrew',
    'Long handled broom',
    'Dustpan',
  ],
  Medium: [
    'Air conditioning',
    'Double size bed',
    '1 tea cup',
    '1 saucer',
    '1 serving plate',
    '2 bowls',
    '1 medium plate',
    '1 big cup',
    '2 beer glasses',
    '2 old fashioned glasses',
    '2 wine glasses',
    '2 champagne glasses',
    '2 forks',
    '2 knives',
    '2 spoons',
    '2 tea spoons',
    '1 saucepan',
    '1 chopping board',
    '1 napkin',
    '1 kettle',
    '1 blender',
    '1 hotplate',
    '1 microwave',
    '1 bedside lamp',
    'Fridge',
    '1 corkscrew',
    'Long handled broom',
    'Dustpan',
    'Dining set',
    'Balcony',
  ],
  Large: [
    'Air conditioning',
    'Queen size bed',
    '1 tea cup',
    '1 saucer',
    '1 serving plate',
    '2 bowls',
    '1 medium plate',
    '1 big cup',
    '2 beer glasses',
    '2 wine glasses',
    '2 champagne glasses',
    '2 forks',
    '2 knives',
    '2 spoons',
    '2 tea spoons',
    '1 saucepan',
    '1 chopping board',
    '1 napkin',
    '1 kettle',
    '1 blender',
    '1 hotplate',
    '1 microwave',
    '1 bedside lamp',
    'Fridge',
    'Corkscrew',
    'Long handled broom',
    'Dustpan',
  ],
  VIP: [
    'Air conditioning',
    'Queen size bed',
    'Balcony',
    '1 tea cup',
    '1 saucer',
    '1 serving plate',
    '2 bowls',
    '1 medium plate',
    '1 big cup',
    '2 beer glasses',
    '2 wine glasses',
    '2 champagne glasses',
    '2 forks',
    '2 knives',
    '2 spoons',
    '2 tea spoons',
    '1 saucepan',
    '1 chopping board',
    '1 napkin',
    '1 kettle',
    '1 blender',
    '1 hotplate',
    '1 microwave',
    '1 bedside lamp',
    'Fridge',
    'Corkscrew',
    'Long handled broom',
    'Dustpan',
  ],
};

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const { setRoom: setStoreRoom, setDates, setGuests: setStoreGuests } = useBookingStore();

  useEffect(() => {
    if (params.id) {
      api.rooms
        .getById(params.id as string)
        .then((data) => {
          setRoom(data);
          setLoading(false);
        })
        .catch(() => {
          const fallbackRoom = defaultRooms.find((item) => item.id === (params.id as string)) || defaultRooms[0];
          setRoom({ ...fallbackRoom, id: params.id as string });
          setLoading(false);
        });
    }
  }, [params.id]);

  const images =
    room?.images && room.images.length > 0
      ? room.images.map((img) => (img.startsWith('http') ? img : getImageUrl(img)))
      : defaultRooms[0].images;

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const getNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleBookNow = () => {
    if (!room || room.isBooked) return;
    setStoreRoom(room.id, room.name, room.price);
    if (checkIn && checkOut) setDates(checkIn, checkOut);
    setStoreGuests(guests);
    router.push('/booking');
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-dark-card border border-dark-border rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-dark-card rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-dark-card rounded w-1/3 animate-pulse" />
              <div className="h-32 bg-dark-card rounded animate-pulse" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!room) return null;

  const roomItems = roomItemsByCategory[room.category] || ['Air conditioning'];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16 pb-24 lg:pb-16">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-6 text-sm"
        >
          <ChevronLeft size={16} />
          Back to Rooms
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-xl overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-72 sm:h-96 lg:h-[500px]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${images[currentImage]})` }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-3 right-3 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Maximize2 size={16} />
              </button>

              {/* Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentImage ? 'bg-gold w-6' : 'bg-white/50 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setCurrentImage(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === currentImage ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${img})` }}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Room Details & Booking */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-gold/70 text-xs tracking-[0.24em] uppercase mb-2">
              {room.category} Room · {room.roomNumber}
            </p>
            <h1 className="text-3xl sm:text-4xl font-light text-gold font-serif italic mb-2">
              {room.name}
            </h1>
            <p className="text-2xl text-white font-semibold mb-6">
              {formatCurrency(room.price)}{' '}
              <span className="text-gray-400 text-base font-normal">/ night</span>
            </p>

            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border mb-6 ${
                room.isBooked
                  ? 'bg-red-500/15 text-red-200 border-red-400/35'
                  : 'bg-emerald-500/15 text-emerald-200 border-emerald-400/35'
              }`}
            >
              {room.isBooked ? 'Booked - unavailable right now' : 'Available for booking'}
            </div>

            <div className="prose prose-invert max-w-none mb-8">
              {room.description.split('\n').map((line, i) => (
                <p key={i} className="text-gray-300 text-sm leading-relaxed mb-2">
                  {line}
                </p>
              ))}
            </div>

            <div className="mb-8 rounded-2xl border border-dark-border bg-dark-card/70 p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gold/70">Room details</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">What’s included in this room</h2>
                </div>
                <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold">
                  {room.category} room
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {roomItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-dark-border bg-dark/50 px-4 py-3 text-sm text-gray-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Booking Card */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 text-lg">Reserve This Room</h3>
              <div className="space-y-4">
                {room.isBooked && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    This room is already booked. Please choose another room.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 tracking-wide">CHECK IN</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      disabled={room.isBooked}
                      className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 tracking-wide">CHECK OUT</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      disabled={room.isBooked}
                      className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 tracking-wide">GUESTS</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    disabled={room.isBooked}
                    className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition-colors cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                {getNights() > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-dark-border pt-4 space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {formatCurrency(room.price)} x {getNights()} night{getNights() > 1 ? 's' : ''}
                      </span>
                      <span className="text-white">{formatCurrency(room.price * getNights())}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-dark-border">
                      <span className="text-white">Total</span>
                      <span className="text-gold">{formatCurrency(room.price * getNights())}</span>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={room.isBooked ? undefined : { scale: 1.02 }}
                  whileTap={room.isBooked ? undefined : { scale: 0.98 }}
                  onClick={handleBookNow}
                  disabled={room.isBooked}
                  className={`w-full font-semibold py-3 rounded-lg transition-colors duration-300 text-sm tracking-wide mt-2 ${
                    room.isBooked
                      ? 'bg-dark border border-red-500/30 text-red-200 cursor-not-allowed'
                      : 'bg-gold hover:bg-gold-light text-dark'
                  }`}
                >
                  {room.isBooked ? 'Room Unavailable' : 'Book Now'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky Mobile Booking Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-dark-card/95 backdrop-blur-md border-t border-dark-border p-4"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-white font-semibold text-lg">
              {formatCurrency(room.price)}
              <span className="text-gray-400 text-sm font-normal"> / night</span>
            </p>
            {getNights() > 0 && (
              <p className="text-gold text-xs">
                {getNights()} night{getNights() > 1 ? 's' : ''} — {formatCurrency(room.price * getNights())} total
              </p>
            )}
          </div>
          <motion.button
            whileHover={room.isBooked ? undefined : { scale: 1.05 }}
            whileTap={room.isBooked ? undefined : { scale: 0.95 }}
            onClick={handleBookNow}
            disabled={room.isBooked}
            className={`font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm ${
              room.isBooked
                ? 'bg-dark border border-red-500/30 text-red-200 cursor-not-allowed'
                : 'bg-gold hover:bg-gold-light text-dark'
            }`}
          >
            {room.isBooked ? 'Unavailable' : 'Book Now'}
          </motion.button>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10"
            >
              <X size={20} />
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="relative w-[90vw] h-[80vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-full h-full bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${images[currentImage]})` }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
