const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: { property: true },
      orderBy: [{ category: 'asc' }, { roomNumber: 'asc' }],
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: { property: true, bookings: true },
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name, category, roomNumber, description, price, images, isBooked, propertyId } = req.body;
    const room = await prisma.room.create({
      data: {
        name,
        category,
        roomNumber,
        description,
        price: parseFloat(price),
        images: images || [],
        isBooked: Boolean(isBooked),
        propertyId,
      },
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room', details: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { name, category, roomNumber, description, price, images, isBooked } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (roomNumber !== undefined) data.roomNumber = roomNumber;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (images !== undefined) data.images = images;
    if (isBooked !== undefined) data.isBooked = Boolean(isBooked);

    const room = await prisma.room.update({
      where: { id: req.params.id },
      data,
    });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room', details: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    await prisma.booking.deleteMany({ where: { roomId: req.params.id } });
    await prisma.room.delete({ where: { id: req.params.id } });
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room', details: error.message });
  }
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom };
