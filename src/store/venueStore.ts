import { create } from 'zustand';
import type { Venue, VenueFilterParams, PaginationParams, CreateVenueRequest } from '../../shared/types';
import { venuesApi } from '../lib/api';

interface VenueFilters extends VenueFilterParams, Partial<PaginationParams> {}

interface VenueState {
  venues: Venue[];
  currentVenue: Venue | null;
  loading: boolean;
  total: number;
  fetchVenues: (filters?: VenueFilters) => Promise<void>;
  fetchVenueById: (id: string) => Promise<void>;
  createVenue: (data: CreateVenueRequest) => Promise<boolean>;
  updateVenue: (id: string, data: Partial<CreateVenueRequest>) => Promise<boolean>;
}

export const useVenueStore = create<VenueState>((set) => ({
  venues: [],
  currentVenue: null,
  loading: false,
  total: 0,

  fetchVenues: async (filters?: VenueFilters): Promise<void> => {
    set({ loading: true });
    try {
      const response = await venuesApi.getVenues(filters);
      if (response.success) {
        set({
          venues: response.data || [],
          total: response.total || 0,
        });
      }
    } finally {
      set({ loading: false });
    }
  },

  fetchVenueById: async (id: string): Promise<void> => {
    set({ loading: true });
    try {
      const response = await venuesApi.getVenueById(id);
      if (response.success && response.data) {
        set({ currentVenue: response.data });
      }
    } finally {
      set({ loading: false });
    }
  },

  createVenue: async (data: CreateVenueRequest): Promise<boolean> => {
    set({ loading: true });
    try {
      const response = await venuesApi.createVenue(data);
      return response.success;
    } finally {
      set({ loading: false });
    }
  },

  updateVenue: async (id: string, data: Partial<CreateVenueRequest>): Promise<boolean> => {
    set({ loading: true });
    try {
      const response = await venuesApi.updateVenue(id, data);
      if (response.success && response.data) {
        set((state) => ({
          venues: state.venues.map((v) => (v.id === id ? response.data! : v)),
          currentVenue: state.currentVenue?.id === id ? response.data : state.currentVenue,
        }));
      }
      return response.success;
    } finally {
      set({ loading: false });
    }
  },
}));
