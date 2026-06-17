import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'venue.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    avatar TEXT,
    company TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS venues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    area REAL NOT NULL,
    capacity INTEGER NOT NULL,
    height REAL,
    description TEXT NOT NULL,
    facilities TEXT NOT NULL,
    images TEXT NOT NULL,
    styleImages TEXT NOT NULL,
    basePrice REAL NOT NULL,
    rating REAL NOT NULL DEFAULT 0,
    reviewCount INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    hostId TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (hostId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS priceConfigs (
    id TEXT PRIMARY KEY,
    venueId TEXT NOT NULL,
    date TEXT NOT NULL,
    timeSlot TEXT NOT NULL,
    price REAL NOT NULL,
    isHoliday INTEGER NOT NULL DEFAULT 0,
    isWeekend INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (venueId) REFERENCES venues(id),
    UNIQUE(venueId, date, timeSlot)
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    venueId TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    unit TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    FOREIGN KEY (venueId) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    venueId TEXT NOT NULL,
    userId TEXT NOT NULL,
    date TEXT NOT NULL,
    timeSlot TEXT NOT NULL,
    eventType TEXT NOT NULL,
    estimatedPeople INTEGER NOT NULL,
    specialRequirements TEXT,
    selectedServices TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    deposit REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    hostReply TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (venueId) REFERENCES venues(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    bookingId TEXT NOT NULL,
    venueId TEXT NOT NULL,
    userId TEXT NOT NULL,
    rating INTEGER NOT NULL,
    content TEXT NOT NULL,
    hostReply TEXT,
    userReply TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (bookingId) REFERENCES bookings(id),
    FOREIGN KEY (venueId) REFERENCES venues(id),
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE(bookingId, userId)
  );

  CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
  CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(type);
  CREATE INDEX IF NOT EXISTS idx_venues_hostId ON venues(hostId);
  CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);
  CREATE INDEX IF NOT EXISTS idx_priceConfigs_venueId ON priceConfigs(venueId);
  CREATE INDEX IF NOT EXISTS idx_priceConfigs_date ON priceConfigs(date);
  CREATE INDEX IF NOT EXISTS idx_services_venueId ON services(venueId);
  CREATE INDEX IF NOT EXISTS idx_bookings_venueId ON bookings(venueId);
  CREATE INDEX IF NOT EXISTS idx_bookings_userId ON bookings(userId);
  CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
  CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
  CREATE INDEX IF NOT EXISTS idx_reviews_venueId ON reviews(venueId);
  CREATE INDEX IF NOT EXISTS idx_reviews_userId ON reviews(userId);
`)

export default db
