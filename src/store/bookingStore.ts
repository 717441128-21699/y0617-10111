import { create } from 'zustand';
import type { Booking, BookingStatus, CreateBookingRequest } from '../../shared/types';
import { bookingsApi } from '../lib/api';

interface BookingParams {
  status?: BookingStatus;
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  fetchBookings: (params?: BookingParams) => Promise<void>;
  createBooking: (data: CreateBookingRequest) => Promise<boolean>;
  updateBookingStatus: (id: string, status: BookingStatus, reply?: string) => Promise<boolean>;
  payDeposit: (id: string) => Promise<boolean>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  currentBooking: null,
  loading: false,

  fetchBookings: async (params?: BookingParams): Promise<void> => {
    set({ loading: true });
    try {
      const response = await bookingsApi.getBookings(params);
      if (response.success) {
        set({ bookings: response.data || [] });
      }
    } finally {
      set({ loading: false });
    }
  },

  createBooking: async (data: CreateBookingRequest): Promise<boolean> => {
    set({ loading: true });
    try {
      const response = await bookingsApi.createBooking(data);
      if (response.success && response.data) {
        set((state) => ({
          bookings: [response.data!, ...state.bookings],
        }));
      }
      return response.success;
    } finally {
      set({ loading: false });
    }
  },

  updateBookingStatus: async (id: string, status: BookingStatus, reply?: string): Promise<boolean> => {
    set({ loading: true });
    try {
      const response = await bookingsApi.updateBookingStatus(id, { status, hostReply: reply });
      if (response.success && response.data) {
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? response.data! : b)),
          currentBooking: state.currentBooking?.id === id ? response.data : state.currentBooking,
        }));
      }
      return response.success;
    } finally {
      set({ loading: false });
    }
  },

  payDeposit: async (id: string): Promise<boolean> => {
    set({ loading: true });
    try {
      const response = await bookingsApi.payDeposit(id);
      if (response.success && response.data) {
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? response.data! : b)),
          currentBooking: state.currentBooking?.id === id ? response.data : state.currentBooking,
        }));
      }
      return response.success;
    } finally {
      set({ loading: false });
    }
  },
}));
