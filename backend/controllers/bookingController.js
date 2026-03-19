const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guests } = req.body;

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.price;

    // Check for overlapping bookings
    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { not: 'cancelled' },
        OR: [
          { checkIn: { lt: checkOutDate }, checkOut: { gt: checkInDate } },
        ],
      },
    });

    if (overlapping) {
      return res.status(409).json({ error: 'Room is not available for the selected dates' });
    }

    const booking = await prisma.booking.create({
      data: {
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        guests: guests || 1,
        status: 'confirmed',
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
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: { room: true },
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking', details: error.message });
  }
};

module.exports = { createBooking, getAllBookings, updateBooking };
