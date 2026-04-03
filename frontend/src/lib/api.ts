const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const ADMIN_PROXY_BASE = '/api/backend-proxy';

const IMAGE_BASE = (() => {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!configuredApiUrl) {
    return 'http://localhost:5000';
  }

  try {
    return new URL(configuredApiUrl).origin;
  } catch {
    return configuredApiUrl.replace(/\/api\/?$/, '');
  }
})();

const toQueryString = (params?: Record<string, string | number | boolean | undefined>) => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export interface Property {
  id: string;
  name: string;
  slug: string;
  city: string;
  description: string | null;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  category: string;
  roomNumber: string;
  description: string;
  price: number;
  images: string[];
  isBooked: boolean;
  propertyId: string;
  createdAt: string;
  property?: {
    id: string;
    name: string;
    slug?: string;
    city?: string;
    description: string;
  };
  bookings?: Booking[];
}

export interface Booking {
  id: string;
  userId: string | null;
  roomId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guests: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  receivedAt: string | null;
  createdAt: string;
  room?: Room;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  order: number;
  propertyId?: string;
  property?: Property;
  createdAt: string;
}

export interface SiteSettings {
  general: {
    siteTitle: string;
    siteTagline: string;
    homeHeroPrimaryText: string;
    homeHeroHighlightText: string;
    homeHeroSecondaryText: string;
    homeHeroDescription: string;
    homeBookingBadge: string;
    homeCtaTitle: string;
    homeCtaDescription: string;
  };
  images: {
    homeHeroImages: string[];
    homeLuxuryCtaImage: string;
    bookNowBackgroundImages: string[];
  };
}

export const defaultSiteSettings: SiteSettings = {
  general: {
    siteTitle: 'THE SUITE',
    siteTagline: 'Refined stays. Seamless booking. Signature comfort.',
    homeHeroPrimaryText: 'Experience',
    homeHeroHighlightText: 'Luxury',
    homeHeroSecondaryText: 'at THE SUITE',
    homeHeroDescription:
      'Discover elegant rooms, effortless reservations, and a boutique luxury experience designed for comfort from the first click.',
    homeBookingBadge: 'Instant confirmation',
    homeCtaTitle: 'Luxurious Comfort Awaits',
    homeCtaDescription:
      'Unwind in style and indulge in unparalleled comfort at THE SUITE. Your perfect getaway starts here.',
  },
  images: {
    homeHeroImages: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=80',
    ],
    homeLuxuryCtaImage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
    bookNowBackgroundImages: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1920&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=80',
    ],
  },
};

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

async function fetchAdminAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${ADMIN_PROXY_BASE}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

async function parseUploadResponse(res: Response): Promise<{ images: string[] }> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || error.details || 'Upload failed');
  }

  return res.json();
}

export const api = {
  properties: {
    getAll: () => fetchAPI<Property[]>('/properties'),
  },
  siteSettings: {
    get: () => fetchAPI<SiteSettings>('/site-settings'),
    update: (data: SiteSettings) =>
      fetchAdminAPI<SiteSettings>('/site-settings', { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
  },
  rooms: {
    getAll: (params?: { propertyId?: string; includeArchived?: boolean }) =>
      fetchAPI<Room[]>(`/rooms${toQueryString(params)}`),
    getById: (id: string) => fetchAPI<Room>(`/rooms/${id}`),
    create: (data: Partial<Room>) => fetchAdminAPI<Room>('/rooms', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
    update: (id: string, data: Partial<Room>) => fetchAdminAPI<Room>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
    delete: (id: string) => fetchAdminAPI<{ message: string }>(`/rooms/${id}`, { method: 'DELETE' }),
  },
  bookings: {
    getAll: (params?: { propertyId?: string }) => fetchAdminAPI<Booking[]>(`/bookings${toQueryString(params)}`),
    search: (query: string) => fetchAPI<Booking[]>(`/bookings/search${toQueryString({ query })}`),
    create: (data: {
      roomId?: string;
      roomCategory?: string;
      propertyId?: string;
      checkIn: string;
      checkOut: string;
      guestName?: string;
      guestEmail?: string;
      guestPhone?: string;
      guests?: number;
      paymentMethod?: string;
    }) => fetchAPI<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { status?: string; paymentStatus?: string; paymentMethod?: string }) =>
      fetchAdminAPI<Booking>(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
    delete: (id: string) => fetchAdminAPI<{ message: string }>(`/bookings/${id}`, { method: 'DELETE' }),
  },
  upload: {
    roomImages: async (files: FileList): Promise<{ images: string[] }> => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      const res = await fetch(`${ADMIN_PROXY_BASE}/upload/room-images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      return parseUploadResponse(res);
    },
    galleryImages: async (files: FileList): Promise<{ images: string[] }> => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      const res = await fetch(`${ADMIN_PROXY_BASE}/upload/gallery-images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      return parseUploadResponse(res);
    },
    siteImages: async (files: FileList): Promise<{ images: string[] }> => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      const res = await fetch(`${ADMIN_PROXY_BASE}/upload/site-images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      return parseUploadResponse(res);
    },
  },
  gallery: {
    getAll: (params?: { propertyId?: string; includeArchived?: boolean }) => fetchAPI<GalleryImage[]>(`/gallery${toQueryString(params)}`),
    create: (data: { url: string; caption?: string; order?: number; propertyId: string }) =>
      fetchAdminAPI<GalleryImage>('/gallery', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
    update: (id: string, data: { url?: string; caption?: string; order?: number; propertyId?: string }) =>
      fetchAdminAPI<GalleryImage>(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }),
    delete: (id: string) => fetchAdminAPI<{ message: string }>(`/gallery/${id}`, { method: 'DELETE' }),
  },
};

export const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_BASE}${normalizedPath}`;
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
  }).format(amount);
