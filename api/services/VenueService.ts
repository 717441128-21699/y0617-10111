import type { Venue, CreateVenueRequest, VenueFilterParams, PaginationParams, VenueStatus, TimeSlot } from '../../shared/types.js';
import { venues, priceConfigs, bookings, generateId } from '../inMemoryData.js';

export class VenueService {
  getVenueById(id: string): Venue | null {
    return venues.find((v) => v.id === id) || null;
  }

  getVenues(filters: VenueFilterParams & PaginationParams): { venues: Venue[]; total: number } {
    let result = venues.filter((v) => v.status === 'published');

    if (filters.city) {
      result = result.filter((v) => v.city === filters.city);
    }

    if (filters.type) {
      result = result.filter((v) => v.type === filters.type);
    }

    if (filters.minPrice !== undefined) {
      result = result.filter((v) => v.basePrice >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter((v) => v.basePrice <= filters.maxPrice!);
    }

    if (filters.minCapacity !== undefined) {
      result = result.filter((v) => v.capacity >= filters.minCapacity!);
    }

    if (filters.maxCapacity !== undefined) {
      result = result.filter((v) => v.capacity <= filters.maxCapacity!);
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(keyword) ||
          v.description.toLowerCase().includes(keyword)
      );
    }

    if (filters.facilities && filters.facilities.length > 0) {
      result = result.filter((v) =>
        filters.facilities!.every((f) => v.facilities.includes(f))
      );
    }

    if (filters.date) {
      const busyVenueIds = new Set<string>();
      for (const booking of bookings) {
        if (booking.status === 'cancelled' || booking.status === 'rejected') continue;
        if (booking.date === filters.date) {
          busyVenueIds.add(booking.venueId);
        }
      }

      result = result.filter((v) => {
        const configs = priceConfigs.filter(
          (pc) => pc.venueId === v.id && pc.date === filters.date
        );
        if (configs.length === 0) return false;

        const bookedSlots = bookings.filter(
          (b) =>
            b.venueId === v.id &&
            b.date === filters.date &&
            b.status !== 'cancelled' &&
            b.status !== 'rejected'
        );

        const fullDayBooked = bookedSlots.some((b) => b.timeSlot === 'fullDay');
        if (fullDayBooked) return false;

        const slots: TimeSlot[] = ['morning', 'afternoon', 'evening'];
        const hasAvailableSlot = slots.some((slot) => {
          const slotBooked = bookedSlots.some((b) => b.timeSlot === slot);
          return !slotBooked;
        });

        return hasAvailableSlot;
      });
    }

    if (filters.sortBy) {
      const sortOrder = filters.sortOrder || 'asc';
      switch (filters.sortBy) {
        case 'price':
          result = [...result].sort((a, b) =>
            sortOrder === 'asc' ? a.basePrice - b.basePrice : b.basePrice - a.basePrice
          );
          break;
        case 'rating':
          result = [...result].sort((a, b) =>
            sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating
          );
          break;
        case 'area':
          result = [...result].sort((a, b) =>
            sortOrder === 'asc' ? a.area - b.area : b.area - a.area
          );
          break;
        case 'bookings': {
          const bookingCountMap = new Map<string, number>();
          for (const booking of bookings) {
            if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
              bookingCountMap.set(
                booking.venueId,
                (bookingCountMap.get(booking.venueId) || 0) + 1
              );
            }
          }
          result = [...result].sort((a, b) => {
            const countA = bookingCountMap.get(a.id) || 0;
            const countB = bookingCountMap.get(b.id) || 0;
            return sortOrder === 'asc' ? countA - countB : countB - countA;
          });
          break;
        }
      }
    }

    const total = result.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const start = (page - 1) * pageSize;
    const pagedResult = result.slice(start, start + pageSize);

    return { venues: pagedResult, total };
  }

  getVenuesByHost(hostId: string): Venue[] {
    return venues.filter((v) => v.hostId === hostId);
  }

  createVenue(hostId: string, request: CreateVenueRequest): Venue {
    const id = generateId('venue');
    const venue: Venue = {
      id,
      hostId,
      name: request.name,
      type: request.type,
      city: request.city,
      address: request.address,
      area: request.area,
      capacity: request.capacity,
      height: request.height,
      description: request.description,
      facilities: request.facilities,
      images: request.images,
      styleImages: request.styleImages,
      basePrice: request.basePrice,
      rating: 0,
      reviewCount: 0,
      status: 'pending' as VenueStatus,
      createdAt: new Date().toISOString(),
    };

    venues.push(venue);
    return venue;
  }

  updateVenue(id: string, hostId: string, data: Partial<CreateVenueRequest>): Venue | null {
    const index = venues.findIndex((v) => v.id === id && v.hostId === hostId);
    if (index === -1) return null;

    venues[index] = { ...venues[index], ...data };
    return venues[index];
  }

  deleteVenue(id: string, hostId: string): boolean {
    const index = venues.findIndex((v) => v.id === id && v.hostId === hostId);
    if (index === -1) return false;

    venues.splice(index, 1);
    return true;
  }

  updateVenueStatus(id: string, status: VenueStatus): Venue | null {
    const index = venues.findIndex((v) => v.id === id);
    if (index === -1) return null;

    venues[index] = { ...venues[index], status };
    return venues[index];
  }
}

export const venueService = new VenueService();
