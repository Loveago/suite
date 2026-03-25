const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
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

export const api = {
  properties: {
    getAll: () => fetchAPI<Property[]>('/properties'),
  },
  rooms: {
    getAll: (params?: { propertyId?: string; includeArchived?: boolean }) =>
      fetchAPI<Room[]>(`/rooms${toQueryString(params)}`),
    getById: (id: string) => fetchAPI<Room>(`/rooms/${id}`),
    create: (data: Partial<Room>) => fetchAPI<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Room>) => fetchAPI<Room>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI<{ message: string }>(`/rooms/${id}`, { method: 'DELETE' }),
  },
  bookings: {
    getAll: (params?: { propertyId?: string }) => fetchAPI<Booking[]>(`/bookings${toQueryString(params)}`),
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
      fetchAPI<Booking>(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  upload: {
    roomImages: async (files: FileList): Promise<{ images: string[] }> => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));
      const res = await fetch(`${API_BASE.replace('/api', '')}/api/upload/room-images`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
  },
  gallery: {
    getAll: (params?: { propertyId?: string; includeArchived?: boolean }) => fetchAPI<GalleryImage[]>(`/gallery${toQueryString(params)}`),
    create: (data: { url: string; caption?: string; order?: number; propertyId: string }) =>
      fetchAPI<GalleryImage>('/gallery', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { url?: string; caption?: string; order?: number; propertyId?: string }) =>
      fetchAPI<GalleryImage>(`/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI<{ message: string }>(`/gallery/${id}`, { method: 'DELETE' }),
  },
};

export const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${base}${path}`;
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
  }).format(amount);
