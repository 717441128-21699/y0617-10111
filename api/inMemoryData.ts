import type {
  User,
  Venue,
  PriceConfig,
  Service,
  Booking,
  Review,
} from '../shared/types.js';
import {
  mockUsers,
  mockVenues,
  mockPriceConfigs,
  mockServices,
  mockBookings,
  mockReviews,
} from './mockData.js';

export let users: User[] = [];
export let venues: Venue[] = [];
export let priceConfigs: PriceConfig[] = [];
export let services: Service[] = [];
export let bookings: Booking[] = [];
export let reviews: Review[] = [];

let idCounters: Record<string, number> = {
  user: 100,
  venue: 100,
  price: 1000,
  service: 100,
  booking: 100,
  review: 100,
};

export function generateId(prefix: string): string {
  if (!(prefix in idCounters)) {
    idCounters[prefix] = 1;
  }
  idCounters[prefix] += 1;
  return `${prefix}${idCounters[prefix]}`;
}

let seeded = false;

export function seed(): void {
  if (seeded) return;

  users = [...mockUsers];
  venues = [...mockVenues];
  priceConfigs = [...mockPriceConfigs];
  services = [...mockServices];
  bookings = [...mockBookings];
  reviews = [...mockReviews];

  const maxUserId = users
    .map((u) => parseInt(u.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  idCounters.user = Math.max(idCounters.user, maxUserId);

  const maxVenueId = venues
    .map((v) => parseInt(v.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  idCounters.venue = Math.max(idCounters.venue, maxVenueId);

  const maxPriceId = priceConfigs
    .map((p) => parseInt(p.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  idCounters.price = Math.max(idCounters.price, maxPriceId);

  const maxServiceId = services
    .map((s) => parseInt(s.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  idCounters.service = Math.max(idCounters.service, maxServiceId);

  const maxBookingId = bookings
    .map((b) => parseInt(b.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  idCounters.booking = Math.max(idCounters.booking, maxBookingId);

  const maxReviewId = reviews
    .map((r) => parseInt(r.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  idCounters.review = Math.max(idCounters.review, maxReviewId);

  seeded = true;
  console.log('In-memory data seeded successfully');
}

export function resetData(): void {
  seeded = false;
  users = [];
  venues = [];
  priceConfigs = [];
  services = [];
  bookings = [];
  reviews = [];
  idCounters = {
    user: 100,
    venue: 100,
    price: 1000,
    service: 100,
    booking: 100,
    review: 100,
  };
}
