const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllProperties = async (_req, res) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: [{ name: 'asc' }],
    });

    const normalizedProperties = properties
      .map((property) => {
        const normalizedName = property.name?.trim().toLowerCase();
        const isAccraProperty = normalizedName === 'american house';

        return {
          ...property,
          slug: property.slug || (isAccraProperty ? 'american-house-accra' : 'the-suite-tema'),
          city: property.city || (isAccraProperty ? 'Accra' : 'Tema'),
        };
      })
      .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));

    res.json(normalizedProperties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

module.exports = { getAllProperties };
