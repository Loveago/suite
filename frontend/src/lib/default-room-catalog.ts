import { Property, Room } from '@/lib/api';

export const roomCategoryOrder = ['Small', 'Medium', 'Large', 'VIP'];

export const defaultProperties: Property[] = [
  {
    id: 'tema-property',
    name: 'The Suite',
    slug: 'the-suite-tema',
    city: 'Tema',
    description: 'A luxury boutique property in Tema community 20 offering premium rooms with world-class amenities.',
    createdAt: new Date(2026, 0, 1).toISOString(),
  },
  {
    id: 'accra-property',
    name: 'American House',
    slug: 'american-house-accra',
    city: 'Accra',
    description: 'An elevated city property in Accra blending polished interiors, calm comfort, and premium hospitality.',
    createdAt: new Date(2026, 0, 2).toISOString(),
  },
];

const categoryImagesByProperty: Record<string, Record<string, string[]>> = {
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

const categoryDescriptionsByProperty: Record<string, Record<string, string>> = {
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

const roomCatalog = [
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K01', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'VIP', roomNumber: 'K02', price: 1500 },
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K03', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'Medium', roomNumber: 'K04', price: 1100 },
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K05', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'Large', roomNumber: 'K06', price: 1300 },
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K07', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K08', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K09', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K10', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K11', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'Large', roomNumber: 'K12', price: 1300 },
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K13', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'Large', roomNumber: 'K14', price: 1300 },
  { propertySlug: 'the-suite-tema', category: 'Large', roomNumber: 'K15', price: 1300 },
  { propertySlug: 'the-suite-tema', category: 'Small', roomNumber: 'K16', price: 800 },
  { propertySlug: 'the-suite-tema', category: 'Large', roomNumber: 'K17', price: 1300 },
  { propertySlug: 'american-house-accra', category: 'Small', roomNumber: 'A01', price: 900 },
  { propertySlug: 'american-house-accra', category: 'Small', roomNumber: 'A02', price: 900 },
  { propertySlug: 'american-house-accra', category: 'Medium', roomNumber: 'A03', price: 1200 },
  { propertySlug: 'american-house-accra', category: 'Medium', roomNumber: 'A04', price: 1200 },
  { propertySlug: 'american-house-accra', category: 'Large', roomNumber: 'A05', price: 1450 },
  { propertySlug: 'american-house-accra', category: 'Large', roomNumber: 'A06', price: 1450 },
  { propertySlug: 'american-house-accra', category: 'VIP', roomNumber: 'A07', price: 1700 },
  { propertySlug: 'american-house-accra', category: 'VIP', roomNumber: 'A08', price: 1700 },
] as const;

export const defaultRooms: Room[] = roomCatalog.map((room, index) => {
  const property = defaultProperties.find((item) => item.slug === room.propertySlug) || defaultProperties[0];

  return {
    id: `default-${room.roomNumber}`,
    name: `${room.category} Room`,
    category: room.category,
    roomNumber: room.roomNumber,
    description: categoryDescriptionsByProperty[property.slug][room.category],
    price: room.price,
    images: categoryImagesByProperty[property.slug][room.category],
    isBooked: false,
    propertyId: property.id,
    property: {
      id: property.id,
      name: property.name,
      slug: property.slug,
      city: property.city,
      description: property.description || '',
    },
    createdAt: new Date(2026, 0, index + 1).toISOString(),
  };
});

export const fallbackGalleryImagesByProperty: Record<string, string[]> = {
  'the-suite-tema': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80',
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
  ],
  'american-house-accra': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
    'https://images.unsplash.com/photo-1616594039964-58e5f4f7b7dd?w=1200&q=80',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
  ],
};

export const getDefaultRoomsForProperty = (propertyId?: string) =>
  propertyId ? defaultRooms.filter((room) => room.propertyId === propertyId) : defaultRooms;
