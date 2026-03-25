const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllRooms = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const propertyId = req.query.propertyId;
    const rooms = await prisma.room.findMany({
      where: {
        ...(includeArchived ? {} : { isActive: true }),
        ...(propertyId ? { propertyId } : {}),
      },
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
    if (!room || room.isActive === false) return res.status(404).json({ error: 'Room not found' });
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
        isActive: true,
        archivedAt: null,
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
    const { name, category, roomNumber, description, price, images, isBooked, propertyId } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (roomNumber !== undefined) data.roomNumber = roomNumber;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (images !== undefined) data.images = images;
    if (isBooked !== undefined) data.isBooked = Boolean(isBooked);
    if (propertyId !== undefined) data.propertyId = propertyId;

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
    const archivedRoom = await prisma.room.update({
      where: { id: req.params.id },
      data: {
        isActive: false,
        archivedAt: new Date(),
        isBooked: false,
      },
    });
    res.json({ message: 'Room archived successfully', room: archivedRoom });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room', details: error.message });
  }
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom };
