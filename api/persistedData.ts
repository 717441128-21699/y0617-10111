import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
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

interface DatabaseSchema {
  users: User[];
  venues: Venue[];
  priceConfigs: PriceConfig[];
  services: Service[];
  bookings: Booking[];
  reviews: Review[];
  idCounter: Record<string, number>;
}

// 使用 process.cwd() 作为项目根目录，确保路径正确
const projectRoot = process.cwd();
const dataDir = `${projectRoot}/data`;
const dbFilePath = `${dataDir}/db.json`;

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultData: DatabaseSchema = {
  users: [],
  venues: [],
  priceConfigs: [],
  services: [],
  bookings: [],
  reviews: [],
  idCounter: {
    user: 100,
    venue: 100,
    price: 1000,
    service: 100,
    booking: 100,
    review: 100,
    cust: 100,
  },
};

const adapter = new JSONFile<DatabaseSchema>(dbFilePath);
export const db = new Low<DatabaseSchema>(adapter, defaultData);

export let users: User[] = [];
export let venues: Venue[] = [];
export let priceConfigs: PriceConfig[] = [];
export let services: Service[] = [];
export let bookings: Booking[] = [];
export let reviews: Review[] = [];

function syncReferences(): void {
  users = db.data.users;
  venues = db.data.venues;
  priceConfigs = db.data.priceConfigs;
  services = db.data.services;
  bookings = db.data.bookings;
  reviews = db.data.reviews;
}

function initIdCountersFromData(): void {
  const maxUserId = db.data.users
    .map((u) => parseInt(u.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  db.data.idCounter.user = Math.max(db.data.idCounter.user || 100, maxUserId);
  db.data.idCounter.cust = Math.max(db.data.idCounter.cust || 100, maxUserId);

  const maxVenueId = db.data.venues
    .map((v) => parseInt(v.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  db.data.idCounter.venue = Math.max(db.data.idCounter.venue || 100, maxVenueId);

  const maxPriceId = db.data.priceConfigs
    .map((p) => parseInt(p.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  db.data.idCounter.price = Math.max(db.data.idCounter.price || 1000, maxPriceId);

  const maxServiceId = db.data.services
    .map((s) => parseInt(s.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  db.data.idCounter.service = Math.max(db.data.idCounter.service || 100, maxServiceId);

  const maxBookingId = db.data.bookings
    .map((b) => parseInt(b.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  db.data.idCounter.booking = Math.max(db.data.idCounter.booking || 100, maxBookingId);

  const maxReviewId = db.data.reviews
    .map((r) => parseInt(r.id.replace(/\D/g, '')) || 0)
    .reduce((a, b) => Math.max(a, b), 0);
  db.data.idCounter.review = Math.max(db.data.idCounter.review || 100, maxReviewId);
}

function isDbEmpty(): boolean {
  return (
    db.data.users.length === 0 &&
    db.data.venues.length === 0 &&
    db.data.priceConfigs.length === 0 &&
    db.data.services.length === 0 &&
    db.data.bookings.length === 0 &&
    db.data.reviews.length === 0
  );
}

export async function seed(): Promise<void> {
  await db.read();

  if (isDbEmpty()) {
    db.data.users = [...mockUsers];
    db.data.venues = [...mockVenues];
    db.data.priceConfigs = [...mockPriceConfigs];
    db.data.services = [...mockServices];
    db.data.bookings = [...mockBookings];
    db.data.reviews = [...mockReviews];

    initIdCountersFromData();

    await db.write();
    console.log('Persisted data seeded successfully from mock data');
  } else {
    initIdCountersFromData();
    await db.write();
    console.log('Persisted data loaded from db.json');
  }

  syncReferences();
}

export function generateId(prefix: string): string {
  if (!(prefix in db.data.idCounter)) {
    db.data.idCounter[prefix] = 0;
  }
  db.data.idCounter[prefix] += 1;
  const id = `${prefix}${db.data.idCounter[prefix]}`;
  return id;
}

syncReferences();
