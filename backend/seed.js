const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const propertiesToSeed = [
    {
      name: 'The Suite',
      slug: 'the-suite-tema',
      city: 'Tema',
      description: 'A luxury boutique property in Tema community 20 offering premium rooms with world-class amenities.',
      galleryImages: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80',
      ],
    },
    {
      name: 'American House',
      slug: 'american-house-accra',
      city: 'Accra',
      description: 'An elevated city property in Accra blending polished interiors, calm comfort, and premium hospitality.',
      galleryImages: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&q=80',
        'https://images.unsplash.com/photo-1616594039964-58e5f4f7b7dd?w=1200&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
      ],
    },
  ];

  const categoryImagesByProperty = {
    'the-suite-tema': {
      Small: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693538694-c5b2d7f3f5f6?auto=format&fit=crop&w=1200&q=80',
      ],
      Medium: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693538694-c5b2d7f3f5f6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
      ],
      Large: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80',
      ],
      VIP: [
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=1200&q=80',
      ],
    },
    'american-house-accra': {
      Small: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80',
      ],
      Medium: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1616594039964-58e5f4f7b7dd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80',
      ],
      Large: [
        'https://images.unsplash.com/photo-1505693538694-c5b2d7f3f5f6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      ],
      VIP: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      ],
    },
  };

  const categoryDescriptionsByProperty = {
    'the-suite-tema': {
      Small: 'An elegant compact room with refined finishes, premium bedding, curated lighting, and all the essentials for a polished luxury stay in Tema.',
      Medium: 'A more spacious retreat in Tema with elevated comfort, stylish detailing, and balanced room proportions for business or leisure travel.',
      Large: 'A generous Tema luxury room offering expanded living space, premium interiors, and a more indulgent stay experience.',
      VIP: 'Our most exclusive Tema category, crafted for guests who want superior privacy, prestige, and a truly elevated experience.',
    },
    'american-house-accra': {
      Small: 'A sleek Accra city room with warm textures, efficient comfort, and luxury essentials designed for short premium stays.',
      Medium: 'A refined American House room with added space, polished furnishings, and a calm urban atmosphere in Accra.',
      Large: 'A spacious Accra stay with expanded comfort, upscale finishes, and a modern hospitality feel for longer city visits.',
      VIP: 'The signature American House experience in Accra, pairing standout comfort, premium styling, and elevated privacy.',
    },
  };

  const roomCatalogByProperty = {
    'the-suite-tema': [
      { category: 'Small', roomNumber: 'K01', price: 800 },
      { category: 'VIP', roomNumber: 'K02', price: 1500 },
      { category: 'Small', roomNumber: 'K03', price: 800 },
      { category: 'Medium', roomNumber: 'K04', price: 1100 },
      { category: 'Small', roomNumber: 'K05', price: 800 },
      { category: 'Large', roomNumber: 'K06', price: 1300 },
      { category: 'Small', roomNumber: 'K07', price: 800 },
      { category: 'Small', roomNumber: 'K08', price: 800 },
      { category: 'Small', roomNumber: 'K09', price: 800 },
      { category: 'Small', roomNumber: 'K10', price: 800 },
      { category: 'Small', roomNumber: 'K11', price: 800 },
      { category: 'Large', roomNumber: 'K12', price: 1300 },
      { category: 'Small', roomNumber: 'K13', price: 800 },
      { category: 'Large', roomNumber: 'K14', price: 1300 },
      { category: 'Large', roomNumber: 'K15', price: 1300 },
      { category: 'Small', roomNumber: 'K16', price: 800 },
      { category: 'Large', roomNumber: 'K17', price: 1300 },
    ],
    'american-house-accra': [
      { category: 'Small', roomNumber: 'A01', price: 900 },
      { category: 'Small', roomNumber: 'A02', price: 900 },
      { category: 'Medium', roomNumber: 'A03', price: 1200 },
      { category: 'Medium', roomNumber: 'A04', price: 1200 },
      { category: 'Large', roomNumber: 'A05', price: 1450 },
      { category: 'Large', roomNumber: 'A06', price: 1450 },
      { category: 'VIP', roomNumber: 'A07', price: 1700 },
      { category: 'VIP', roomNumber: 'A08', price: 1700 },
    ],
  };

  const seededProperties = [];

  for (const propertySeed of propertiesToSeed) {
    const existingProperty = await prisma.property.findFirst({
      where: {
        OR: [
          { slug: propertySeed.slug },
          { name: propertySeed.name },
          {
            name:
              propertySeed.slug === 'the-suite-tema'
                ? 'THE SUITE'
                : propertySeed.name,
          },
        ],
      },
    });

    const property = existingProperty
      ? await prisma.property.update({
          where: { id: existingProperty.id },
          data: {
            name: propertySeed.name,
            slug: propertySeed.slug,
            city: propertySeed.city,
            description: propertySeed.description,
          },
        })
      : await prisma.property.create({
          data: {
            name: propertySeed.name,
            slug: propertySeed.slug,
            city: propertySeed.city,
            description: propertySeed.description,
          },
        });

    seededProperties.push(property);

    const rooms = roomCatalogByProperty[propertySeed.slug].map((room) => ({
      name: `${room.category} Room`,
      category: room.category,
      roomNumber: room.roomNumber,
      description: categoryDescriptionsByProperty[propertySeed.slug][room.category],
      price: room.price,
      images: categoryImagesByProperty[propertySeed.slug][room.category],
      isActive: true,
      archivedAt: null,
      propertyId: property.id,
    }));

    for (const room of rooms) {
      await prisma.room.upsert({
        where: { roomNumber: room.roomNumber },
        update: room,
        create: room,
      });
    }

    for (const [index, imageUrl] of propertySeed.galleryImages.entries()) {
      const existingImage = await prisma.galleryImage.findFirst({
        where: { propertyId: property.id, url: imageUrl },
      });

      if (!existingImage) {
        await prisma.galleryImage.create({
          data: {
            url: imageUrl,
            order: index,
            caption: `${property.name} showcase ${index + 1}`,
            propertyId: property.id,
            isActive: true,
            archivedAt: null,
          },
        });
      }
    }
  }

  console.log('Seed completed successfully!');
  console.log(`Seeded properties: ${seededProperties.map((property) => `${property.name} (${property.city})`).join(', ')}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
