const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllProperties = async (_req, res) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
    });

    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

module.exports = { getAllProperties };
