'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { api, Room, formatCurrency, getImageUrl } from '@/lib/api';
import { defaultRooms, roomCategoryOrder } from '@/lib/default-room-catalog';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');

  useEffect(() => {
    api.rooms
      .getAll()
      .then((data) => {
        setRooms(data.length > 0 ? data : defaultRooms);
        setLoading(false);
      })
      .catch(() => {
        setRooms(defaultRooms);
        setLoading(false);
      });
  }, []);

  const filteredRooms = rooms
    .filter((room) => room.price >= priceRange[0] && room.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const getRoomImage = (room: Room) => {
    if (room.images && room.images.length > 0) {
      const img = room.images[0];
      if (img.startsWith('http')) return img;
      return getImageUrl(img);
    }
    return defaultRooms[0].images[0];
  };

  const groupedRooms = roomCategoryOrder
    .map((category) => ({
      category,
      rooms: filteredRooms.filter((room) => room.category === category),
    }))
    .filter((group) => group.rooms.length > 0);

  return (
    <PageTransition>
      {/* Header */}
      <section className="relative py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl sm:text-5xl font-light text-gold mb-3 font-serif italic">
              Our Rooms
            </h1>
            <p className="text-gray-400 text-sm tracking-wide max-w-lg mx-auto text-center">
              Explore each room category, room number, and nightly rate across our curated luxury collection.
            </p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-10 bg-dark-card border border-dark-border rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-gold transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
              <span className="text-gray-500 text-sm">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold transition-colors cursor-pointer"
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </motion.div>

          {/* Expandable Filter Panel */}
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-sm">Price Range</h3>
                    <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Min (GHC)</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-24 bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                    <span className="text-gray-500 mt-5">—</span>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Max (GHC)</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-24 bg-dark border border-dark-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                    <button
                      onClick={() => setPriceRange([0, 2000])}
                      className="mt-5 text-xs text-gold hover:text-gold-light transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-dark-card border border-dark-border rounded-xl overflow-hidden"
                >
                  <div className="h-56 bg-dark-border animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-dark-border rounded animate-pulse w-2/3" />
                    <div className="h-4 bg-dark-border rounded animate-pulse w-1/3" />
                    <div className="h-8 bg-dark-border rounded animate-pulse w-1/2" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Rooms Grid */}
          {!loading && (
            <div className="space-y-10">
              <AnimatePresence mode="popLayout">
                {groupedRooms.map((group, groupIndex) => (
                  <motion.section
                    key={group.category}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.35, delay: groupIndex * 0.06 }}
                    className="space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                      <div>
                        <p className="text-gold/70 text-xs tracking-[0.24em] uppercase mb-2">Room Category</p>
                        <h2 className="text-2xl sm:text-3xl text-white font-semibold">{group.category} Rooms</h2>
                      </div>
                      <div className="text-sm text-gray-400">
                        {group.rooms.length} room{group.rooms.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                      {group.rooms.map((room, roomIndex) => (
                        <motion.div
                          key={room.id}
                          layout
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.35, delay: roomIndex * 0.04 }}
                        >
                          <Link href={`/rooms/${room.id}`}>
                            <motion.div
                              whileHover={room.isBooked ? undefined : { y: -8, scale: 1.01 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                              className={`bg-dark-card border rounded-2xl overflow-hidden group h-full ${
                                room.isBooked ? 'border-red-500/30 opacity-80' : 'border-dark-border cursor-pointer'
                              }`}
                            >
                              <div className="relative h-56 sm:h-64 overflow-hidden">
                                <div
                                  className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ${
                                    room.isBooked ? '' : 'group-hover:scale-110'
                                  }`}
                                  style={{ backgroundImage: `url(${getRoomImage(room)})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                <div className="absolute top-3 left-3 bg-black/55 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">
                                  Room {room.roomNumber}
                                </div>
                                <div className="absolute top-3 right-3 bg-gold text-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                  {formatCurrency(room.price)}/night
                                </div>
                                <div
                                  className={`absolute bottom-3 left-3 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                                    room.isBooked
                                      ? 'bg-red-500/20 text-red-200 border-red-400/40'
                                      : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                                  }`}
                                >
                                  {room.isBooked ? 'Booked' : 'Available'}
                                </div>
                              </div>
                              <div className="p-5">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                  <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                                  <span className="text-xs uppercase tracking-[0.2em] text-gold/70">{room.category}</span>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{room.description}</p>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-gray-500 text-xs">Images: {room.images.length}</span>
                                  <motion.div
                                    whileHover={room.isBooked ? undefined : { scale: 1.04 }}
                                    className={`inline-block text-xs font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                                      room.isBooked
                                        ? 'bg-red-500/10 border border-red-400/40 text-red-200'
                                        : 'bg-gold/10 border border-gold text-gold hover:bg-gold hover:text-dark'
                                    }`}
                                  >
                                    {room.isBooked ? 'View Details' : 'Book Room'}
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && filteredRooms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-400 text-lg">No rooms match your filters.</p>
              <button
                onClick={() => setPriceRange([0, 2000])}
                className="mt-4 text-gold hover:text-gold-light transition-colors text-sm"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
