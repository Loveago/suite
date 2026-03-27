const { PrismaClient } = require('@prisma/client');
const { sendBookingConfirmationEmail } = require('../services/bookingEmailService');
const prisma = new PrismaClient();

const ACTIVE_BOOKING_STATUSES = ['confirmed', 'received'];

const syncRoomBookedStatus = async (roomId) => {
  const activeBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      status: { in: ACTIVE_BOOKING_STATUSES },
    },
    select: { id: true },
  });

  await prisma.room.update({
    where: { id: roomId },
    data: { isBooked: Boolean(activeBooking) },
  });
};

const createBooking = async (req, res) => {
  try {
    const { roomId, roomCategory, propertyId, checkIn, checkOut, guestName, guestEmail, guestPhone, guests, paymentMethod } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out must be after check-in' });
    }

    if (!roomId && !roomCategory) {
      return res.status(400).json({ error: 'Room or room category is required' });
    }

    if (!roomId && !propertyId) {
      return res.status(400).json({ error: 'Property is required when booking by category' });
    }

    const overlappingRoomIds = await prisma.booking.findMany({
      where: {
        status: { in: ACTIVE_BOOKING_STATUSES },
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
      if (room.isActive === false) {
        return res.status(409).json({ error: 'Selected room is no longer available' });
      }
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
          propertyId,
          isActive: true,
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
        status: 'confirmed',
        paymentMethod: selectedPaymentMethod,
        paymentStatus: selectedPaymentMethod === 'cash_on_arrival' ? 'pending' : 'unpaid',
      },
      include: { room: true },
    });

    await syncRoomBookedStatus(room.id);

    try {
      await sendBookingConfirmationEmail(booking);
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError.message);
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const propertyId = req.adminSession?.role === 'property'
      ? req.adminScopedProperty?.id
      : req.query.propertyId;

    if (req.adminSession?.role === 'property' && !propertyId) {
      return res.status(403).json({ error: 'Assigned property could not be resolved for this admin account' });
    }

    const bookings = await prisma.booking.findMany({
      where: propertyId
        ? {
            room: {
              propertyId,
            },
          }
        : undefined,
      include: { room: { include: { property: true } } },
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
    const existingBooking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      select: { id: true, roomId: true, checkIn: true, checkOut: true, status: true, receivedAt: true, room: { select: { propertyId: true } } },
    });

    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (req.adminSession?.role === 'property' && existingBooking.room?.propertyId !== req.adminScopedProperty?.id) {
      return res.status(403).json({ error: 'You do not have access to this property' });
    }

    const updateData = {};

    if (status) {
      if (ACTIVE_BOOKING_STATUSES.includes(status)) {
        const conflictingBooking = await prisma.booking.findFirst({
          where: {
            id: { not: existingBooking.id },
            roomId: existingBooking.roomId,
            status: { in: ACTIVE_BOOKING_STATUSES },
            checkIn: { lt: existingBooking.checkOut },
            checkOut: { gt: existingBooking.checkIn },
          },
          select: { id: true },
        });

        if (conflictingBooking) {
          return res.status(409).json({ error: 'This room already has a confirmed booking for the selected dates' });
        }
      }

      updateData.status = status;
      if (status === 'received') {
        updateData.receivedAt = new Date();
        if (!paymentStatus) {
          updateData.paymentStatus = 'paid';
        }
      }

      if (status === 'checked_out') {
        updateData.receivedAt = updateData.receivedAt || existingBooking.receivedAt || null;
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
      include: { room: { include: { property: true } } },
    });

    if (status && (ACTIVE_BOOKING_STATUSES.includes(status) || ACTIVE_BOOKING_STATUSES.includes(existingBooking.status) || status === 'cancelled' || status === 'checked_out')) {
      await syncRoomBookedStatus(existingBooking.roomId);
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking', details: error.message });
  }
};

module.exports = { createBooking, getAllBookings, updateBooking };
