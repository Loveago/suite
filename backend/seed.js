const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.property.deleteMany();

  // Create the property
  const property = await prisma.property.create({
    data: {
      name: 'THE SUIT',
      description: 'A luxury boutique property offering premium rooms with world-class amenities.',
    },
  });

  // Create rooms
  const rooms = [
    {
      name: 'Royal Suite',
      description:
        'Experience unparalleled luxury in our Royal Suite. Featuring a king-size bed, panoramic city views, a marble bathroom with rain shower, and a private lounge area. Perfect for those who demand nothing but the finest.',
      price: 350,
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
      ],
      propertyId: property.id,
    },
    {
      name: 'Ocean View Room',
      description:
        'Wake up to breathtaking ocean views in this elegantly appointed room. Features a queen-size bed, floor-to-ceiling windows, a luxurious bathroom, and a private balcony overlooking the sea.',
      price: 280,
      images: [
        '/uploads/rooms/ocean-view-1.jpg',
        '/uploads/rooms/ocean-view-2.jpg',
        '/uploads/rooms/ocean-view-3.jpg',
      ],
      propertyId: property.id,
    },
    {
      name: 'Penthouse Loft',
      description:
        'Our crown jewel — the Penthouse Loft spans two floors with a spiral staircase, rooftop terrace, jacuzzi, and 360-degree views. The ultimate in urban luxury living.',
      price: 450,
      images: [
        '/uploads/rooms/penthouse-1.jpg',
        '/uploads/rooms/penthouse-2.jpg',
        '/uploads/rooms/penthouse-3.jpg',
      ],
      propertyId: property.id,
    },
    {
      name: 'Garden Retreat',
      description:
        'A serene ground-floor suite surrounded by lush gardens. Features a private patio, outdoor shower, king-size bed, and direct garden access for a tranquil escape.',
      price: 220,
      images: [
        '/uploads/rooms/garden-1.jpg',
        '/uploads/rooms/garden-2.jpg',
        '/uploads/rooms/garden-3.jpg',
      ],
      propertyId: property.id,
    },
    {
      name: 'Executive Suite',
      description:
        'Designed for the discerning business traveler. Includes a spacious work desk, high-speed WiFi, a sitting area, mini bar, and premium bedding for restful nights.',
      price: 310,
      images: [
        '/uploads/rooms/executive-1.jpg',
        '/uploads/rooms/executive-2.jpg',
        '/uploads/rooms/executive-3.jpg',
      ],
      propertyId: property.id,
    },
    {
      name: 'Honeymoon Suite',
      description:
        'Romance awaits in our Honeymoon Suite. Rose petal turndown service, champagne on arrival, a heart-shaped jacuzzi, and candlelit ambiance create the perfect getaway for couples.',
      price: 400,
      images: [
        '/uploads/rooms/honeymoon-1.jpg',
        '/uploads/rooms/honeymoon-2.jpg',
        '/uploads/rooms/honeymoon-3.jpg',
      ],
      propertyId: property.id,
    },
  ];

  for (const room of rooms) {
    await prisma.room.create({ data: room });
  }

  console.log('Seed completed successfully!');
  console.log(`Created property: ${property.name}`);
  console.log(`Created ${rooms.length} rooms`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
