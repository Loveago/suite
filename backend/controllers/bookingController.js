const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBooking = async (req, res) => {
  try {
    const { roomId, roomCategory, checkIn, checkOut, guestName, guestEmail, guestPhone, guests, paymentMethod } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }

    if (!roomId && !roomCategory) {
      return res.status(400).json({ error: 'Room or room category is required' });
    }

    const overlappingRoomIds = await prisma.booking.findMany({
      where: {
        status: { not: 'cancelled' },
        OR: [
          { checkIn: { lt: checkOutDate }, checkOut: { gt: checkInDate } },
        ],
      },
      select: { roomId: true },
    });

    const unavailableRoomIds = overlappingRoomIds.map((booking) => booking.roomId);

    let room;

    if (roomId) {
      room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (room.isBooked) {
        return res.status(409).json({ error: 'Selected room is currently marked as booked' });
      }
      if (unavailableRoomIds.includes(room.id)) {
        return res.status(409).json({ error: 'Selected room is not available for the selected dates' });
      }
    } else {
      const availableRooms = await prisma.room.findMany({
        where: {
          category: roomCategory,
          isBooked: false,
          id: { notIn: unavailableRoomIds },
        },
        orderBy: { roomNumber: 'asc' },
      });

      if (availableRooms.length === 0) {
        return res.status(409).json({ error: 'No available rooms in this category for the selected dates' });
      }

      room = availableRooms[Math.floor(Math.random() * availableRooms.length)];
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.price;
    const selectedPaymentMethod = paymentMethod || 'cash_on_arrival';

    const booking = await prisma.booking.create({
      data: {
        roomId: room.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        guests: guests || 1,
        status: 'pending',
        paymentMethod: selectedPaymentMethod,
        paymentStatus: selectedPaymentMethod === 'cash_on_arrival' ? 'pending' : 'unpaid',
      },
      include: { room: true },
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { status, paymentStatus, paymentMethod } = req.body;
    const updateData = {};

    if (status) {
      updateData.status = status;
      if (status === 'received') {
        updateData.receivedAt = new Date();
        if (!paymentStatus) {
          updateData.paymentStatus = 'paid';
        }
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData,
      include: { room: true },
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking', details: error.message });
  }
};

module.exports = { createBooking, getAllBookings, updateBooking };
