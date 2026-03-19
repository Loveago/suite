import { Room } from '@/lib/api';

const categoryImages: Record<string, string[]> = {
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
};

const categoryDescriptions: Record<string, string> = {
  Small:
    'An elegant compact room with refined finishes, premium bedding, curated lighting, and all the essentials for a polished luxury stay.',
  Medium:
    'A more spacious retreat with elevated comfort, stylish detailing, and balanced room proportions for business or leisure travel.',
  Large:
    'A generous luxury room offering expanded living space, premium interiors, and a more indulgent stay experience.',
  VIP:
    'Our most exclusive category, crafted for guests who want superior privacy, prestige, and a truly elevated experience.',
};

const roomCatalog = [
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
] as const;

export const defaultRooms: Room[] = roomCatalog.map((room, index) => ({
  id: `default-${room.roomNumber}`,
  name: `${room.category} Room`,
  category: room.category,
  roomNumber: room.roomNumber,
  description: categoryDescriptions[room.category],
  price: room.price,
  images: categoryImages[room.category],
  isBooked: false,
  propertyId: 'default-property',
  createdAt: new Date(2026, 0, index + 1).toISOString(),
}));

export const roomCategoryOrder = ['Small', 'Medium', 'Large', 'VIP'];
