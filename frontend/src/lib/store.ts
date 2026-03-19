'use client';

import { create } from 'zustand';

interface BookingState {
  roomId: string | null;
  roomName: string | null;
  roomPrice: number | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  step: number;
  setRoom: (id: string, name: string, price: number) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: number) => void;
  setGuestDetails: (name: string, email: string, phone: string) => void;
  setStep: (step: number) => void;
  reset: () => void;
  getNights: () => number;
  getTotalPrice: () => number;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  roomId: null,
  roomName: null,
  roomPrice: null,
  checkIn: '',
  checkOut: '',
  guests: 2,
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  step: 1,
  setRoom: (id, name, price) => set({ roomId: id, roomName: name, roomPrice: price }),
  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
  setGuests: (guests) => set({ guests }),
  setGuestDetails: (guestName, guestEmail, guestPhone) => set({ guestName, guestEmail, guestPhone }),
  setStep: (step) => set({ step }),
  reset: () =>
    set({
      roomId: null,
      roomName: null,
      roomPrice: null,
      checkIn: '',
      checkOut: '',
      guests: 2,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      step: 1,
    }),
  getNights: () => {
    const { checkIn, checkOut } = get();
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  },
  getTotalPrice: () => {
    const { roomPrice } = get();
    const nights = get().getNights();
    if (!roomPrice || nights <= 0) return 0;
    return nights * roomPrice;
  },
}));
