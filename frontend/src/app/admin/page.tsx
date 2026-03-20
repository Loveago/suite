'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Upload,
  X,
  Save,
  BedDouble,
  CalendarCheck,
  DollarSign,
  LogOut,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { api, Room, Booking, GalleryImage, formatCurrency, getImageUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';

type Tab = 'rooms' | 'bookings' | 'gallery';

interface RoomForm {
  name: string;
  category: string;
  roomNumber: string;
  description: string;
  price: string;
  images: string[];
  propertyId: string;
}

const emptyRoomForm: RoomForm = {
  name: '',
  category: '',
  roomNumber: '',
  description: '',
  price: '',
  images: [],
  propertyId: '',
};

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState<RoomForm>(emptyRoomForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, bookingsData, galleryData] = await Promise.all([
        api.rooms.getAll().catch(() => []),
        api.bookings.getAll().catch(() => []),
        api.gallery.getAll().catch(() => []),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
      setGalleryImages(galleryData);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const result = await api.upload.roomImages(files);
      setRoomForm((prev) => ({ ...prev, images: [...prev.images, ...result.images] }));
    } catch {
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRoom(null);
    setRoomForm(emptyRoomForm);
    setShowRoomModal(true);
    setError('');
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      category: room.category,
      roomNumber: room.roomNumber,
      description: room.description,
      price: room.price.toString(),
      images: room.images,
      propertyId: room.propertyId,
    });
    setShowRoomModal(true);
    setError('');
  };

  const handleSaveRoom = async () => {
    if (!roomForm.name || !roomForm.category || !roomForm.roomNumber || !roomForm.description || !roomForm.price) {
      setError('Please fill all required fields');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingRoom) {
        await api.rooms.update(editingRoom.id, {
          name: roomForm.name,
          category: roomForm.category,
          roomNumber: roomForm.roomNumber,
          description: roomForm.description,
          price: parseFloat(roomForm.price),
          images: roomForm.images,
        });
      } else {
        const propertyId = roomForm.propertyId || rooms[0]?.propertyId || 'default';
        await api.rooms.create({
          name: roomForm.name,
          category: roomForm.category,
          roomNumber: roomForm.roomNumber,
          description: roomForm.description,
          price: parseFloat(roomForm.price),
          images: roomForm.images,
          propertyId,
        });
      }
      setShowRoomModal(false);
      loadData();
    } catch {
      setError('Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.rooms.delete(id);
      loadData();
    } catch {
      alert('Failed to delete room');
    }
  };

  const handleToggleRoomBooked = async (room: Room) => {
    try {
      await api.rooms.update(room.id, { isBooked: !room.isBooked });
      loadData();
    } catch {
      alert('Failed to update room occupancy');
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await api.bookings.update(id, {
        status,
        ...(status === 'received' ? { paymentStatus: 'paid' } : {}),
      });
      loadData();
    } catch {
      alert('Failed to update booking');
    }
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const removeImage = (index: number) => {
    setRoomForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddGalleryImage = async () => {
    if (!newGalleryUrl.trim()) return;
    try {
      await api.gallery.create({
        url: newGalleryUrl,
        caption: newGalleryCaption || undefined,
        order: galleryImages.length,
      });
      setNewGalleryUrl('');
      setNewGalleryCaption('');
      loadData();
    } catch {
      setError('Failed to add gallery image');
    }
  };

  const handleDeleteGalleryImage = async (id: string) => {
    if (!confirm('Delete this gallery image?')) return;
    try {
      await api.gallery.delete(id);
      loadData();
    } catch {
      setError('Failed to delete gallery image');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'received':
        return 'bg-blue-500/20 text-blue-300';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const stats = {
    totalRooms: rooms.length,
    totalBookings: bookings.length,
    revenue: bookings
      .filter((booking) => booking.paymentStatus === 'paid')
      .reduce((sum, booking) => sum + booking.totalPrice, 0),
  };

  const groupedRooms = rooms.reduce<Record<string, Room[]>>((acc, room) => {
    if (!acc[room.category]) {
      acc[room.category] = [];
    }
    acc[room.category].push(room);
    return acc;
  }, {});

  const categoryOrder = ['Small', 'Medium', 'Large', 'VIP'];

  const sortedRoomGroups = categoryOrder
    .filter((category) => groupedRooms[category]?.length)
    .map((category) => ({
      category,
      rooms: [...groupedRooms[category]].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })),
    }));

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.push('/admincp');
      router.refresh();
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-light text-gold font-serif italic mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-400 text-sm">Manage rooms, bookings, and images</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 border border-dark-border bg-dark-card hover:border-gold/40 hover:text-gold text-gray-300 px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <LogOut size={16} />
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Total Rooms', value: stats.totalRooms, icon: BedDouble, color: 'text-blue-400' },
            { label: 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'text-green-400' },
            {
              label: 'Revenue',
              value: formatCurrency(stats.revenue),
              icon: DollarSign,
              color: 'text-gold',
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-dark-card border border-dark-border rounded-xl p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-lg bg-dark flex items-center justify-center ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">{stat.label}</p>
                <p className="text-white text-xl font-semibold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-dark-card border border-dark-border rounded-xl p-1 w-fit">
          {(['rooms', 'bookings', 'gallery'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? 'text-dark' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === t && (
                <motion.div
                  layoutId="adminTab"
                  className="absolute inset-0 bg-gold rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>

        {/* Rooms Tab */}
        <AnimatePresence mode="wait">
          {tab === 'rooms' && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-white font-semibold">Rooms ({rooms.length})</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openCreateModal}
                  className="flex items-center gap-2 bg-gold hover:bg-gold-light text-dark font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  <Plus size={16} />
                  Add Room
                </motion.button>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-24 h-20 bg-dark-border rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-dark-border rounded w-1/3" />
                          <div className="h-4 bg-dark-border rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-16 bg-dark-card border border-dark-border rounded-xl">
                  <BedDouble className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No rooms yet</p>
                  <button onClick={openCreateModal} className="text-gold hover:text-gold-light text-sm">
                    Create your first room
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedRoomGroups.map((group, groupIndex) => (
                    <motion.div
                      key={group.category}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.05 }}
                      className="space-y-3"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCategory(group.category)}
                        className="w-full flex items-center justify-between gap-3 border-b border-dark-border pb-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">
                            {collapsedCategories[group.category] ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                          </span>
                          <div>
                            <p className="text-gold/70 text-[10px] uppercase tracking-[0.22em] mb-1">Category</p>
                            <h3 className="text-white text-lg font-semibold">{group.category} Rooms</h3>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {group.rooms.length} room{group.rooms.length !== 1 ? 's' : ''}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {!collapsedCategories[group.category] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-3 overflow-hidden"
                          >
                            {group.rooms.map((room, roomIndex) => (
                              <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: roomIndex * 0.03 }}
                                className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col sm:flex-row gap-4"
                              >
                                <div
                                  className="w-full sm:w-28 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                                  style={{
                                    backgroundImage: `url(${room.images[0]?.startsWith('http')
                                      ? room.images[0]
                                      : room.images[0]
                                      ? getImageUrl(room.images[0])
                                      : 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80'})`,
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="text-white font-semibold">{room.name}</h3>
                                    <span className="text-[10px] uppercase tracking-[0.18em] text-gray-400 border border-dark-border rounded-full px-2 py-1">
                                      {room.roomNumber}
                                    </span>
                                    <span
                                      className={`text-[10px] uppercase tracking-[0.18em] rounded-full px-2 py-1 border ${
                                        room.isBooked
                                          ? 'text-red-300 border-red-500/40 bg-red-500/10'
                                          : 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
                                      }`}
                                    >
                                      {room.isBooked ? 'Booked' : 'Unbooked'}
                                    </span>
                                  </div>
                                  <p className="text-gray-400 text-sm truncate">{room.description}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-gold font-semibold text-sm">{formatCurrency(room.price)}/night</span>
                                    <span className="text-gray-500 text-xs">{room.images.length} images</span>
                                  </div>
                                </div>
                                <div className="flex sm:flex-col gap-2 justify-end">
                                  <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    onClick={() => handleToggleRoomBooked(room)}
                                    className={`min-w-[112px] h-9 rounded-lg border text-xs font-semibold transition-colors px-3 ${
                                      room.isBooked
                                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                                        : 'bg-red-500/10 border-red-500/40 text-red-300 hover:bg-red-500/20'
                                    }`}
                                  >
                                    {room.isBooked ? 'Mark Unbooked' : 'Mark Booked'}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => openEditModal(room)}
                                    className="w-9 h-9 rounded-lg bg-dark border border-dark-border flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold transition-colors"
                                  >
                                    <Edit3 size={14} />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() => handleDeleteRoom(room.id)}
                                    className="w-9 h-9 rounded-lg bg-dark border border-dark-border flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-400 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl text-white font-semibold mb-6">
                Bookings ({bookings.length})
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-6 animate-pulse">
                      <div className="h-5 bg-dark-border rounded w-1/3 mb-3" />
                      <div className="h-4 bg-dark-border rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16 bg-dark-card border border-dark-border rounded-xl">
                  <CalendarCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-dark-card border border-dark-border rounded-xl p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-white font-semibold">
                            {booking.room?.name || 'Room'}{' '}
                            <span className="text-gray-500 text-xs font-mono ml-2">
                              {booking.id.slice(0, 8)}...
                            </span>
                          </h3>
                          <p className="text-gold/70 text-xs tracking-[0.18em] uppercase mt-1">
                            {booking.room?.category || 'Category'} · {booking.room?.roomNumber || 'Room Number'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {booking.guestName || 'Guest'} — {booking.guestEmail || 'N/A'}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Payment: {booking.paymentMethod === 'cash_on_arrival' ? 'Cash on arrival' : booking.paymentMethod} · {booking.paymentStatus}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                          <select
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                            className="bg-dark border border-dark-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-gold cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500 text-xs block">Check-in</span>
                          <span className="text-white">{new Date(booking.checkIn).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">Check-out</span>
                          <span className="text-white">{new Date(booking.checkOut).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">Guests</span>
                          <span className="text-white">{booking.guests}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">Total</span>
                          <span className="text-gold font-semibold">{formatCurrency(booking.totalPrice)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">Booked</span>
                          <span className="text-white">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs block">Received</span>
                          <span className="text-white">
                            {booking.receivedAt ? new Date(booking.receivedAt).toLocaleDateString() : 'Not yet'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl text-white font-semibold mb-6">
                Gallery Images ({galleryImages.length})
              </h2>

              <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-6">
                <h3 className="text-white font-semibold mb-4">Add New Image</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Image URL *</label>
                    <input
                      type="text"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Caption (Optional)</label>
                    <input
                      type="text"
                      value={newGalleryCaption}
                      onChange={(e) => setNewGalleryCaption(e.target.value)}
                      placeholder="Beautiful lobby view..."
                      className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddGalleryImage}
                    className="flex items-center gap-2 bg-gold hover:bg-gold-light text-dark font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Plus size={16} />
                    Add Image
                  </motion.button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-dark-card border border-dark-border rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-16 bg-dark-card border border-dark-border rounded-xl">
                  <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No gallery images yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((image, i) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative aspect-square bg-dark-card border border-dark-border rounded-xl overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${image.url})` }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteGalleryImage(image.id)}
                          className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
                          <p className="text-white text-xs truncate">{image.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Room Modal */}
      <AnimatePresence>
        {showRoomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowRoomModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-white font-semibold">
                  {editingRoom ? 'Edit Room' : 'Create Room'}
                </h2>
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 tracking-wide">ROOM NAME *</label>
                  <input
                    type="text"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    placeholder="Small Room"
                    className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 tracking-wide">CATEGORY *</label>
                    <select
                      value={roomForm.category}
                      onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
                      className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="">Select category</option>
                      {['Small', 'Medium', 'Large', 'VIP'].map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 tracking-wide">ROOM NUMBER *</label>
                    <input
                      type="text"
                      value={roomForm.roomNumber}
                      onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value.toUpperCase() })}
                      placeholder="K01"
                      className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 tracking-wide">DESCRIPTION *</label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                    placeholder="A luxurious room with premium amenities..."
                    rows={4}
                    className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 tracking-wide">PRICE PER NIGHT (GHC) *</label>
                  <input
                    type="number"
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                    placeholder="800"
                    className="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 tracking-wide">IMAGES</label>
                  <div className="space-y-3">
                    {roomForm.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {roomForm.images.map((img, i) => (
                          <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden group">
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${img.startsWith('http') ? img : getImageUrl(img)})`,
                              }}
                            />
                            <button
                              onClick={() => removeImage(i)}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full border-2 border-dashed border-dark-border hover:border-gold rounded-lg py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm"
                    >
                      {uploading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full"
                        />
                      ) : (
                        <Upload size={16} />
                      )}
                      {uploading ? 'Uploading...' : 'Upload Images'}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowRoomModal(false)}
                    className="flex-1 border border-dark-border text-gray-300 hover:text-white py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveRoom}
                    disabled={saving}
                    className="flex-1 bg-gold hover:bg-gold-light text-dark font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full"
                      />
                    ) : (
                      <Save size={14} />
                    )}
                    {saving ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
