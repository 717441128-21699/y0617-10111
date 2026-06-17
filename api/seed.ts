import db from './db.js';
import { mockUsers, mockVenues, mockPriceConfigs, mockServices, mockBookings, mockReviews } from './mockData.js';
import type { User, Venue, PriceConfig, Service, Booking, Review } from '../shared/types.js';

function seedUsers(users: User[]): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO users (id, role, name, email, phone, avatar, company, created_at)
    VALUES (@id, @role, @name, @email, @phone, @avatar, @company, @createdAt)
  `);

  const insertMany = db.transaction((list: User[]) => {
    for (const user of list) {
      stmt.run({
        ...user,
        createdAt: user.createdAt || new Date().toISOString(),
      });
    }
  });

  insertMany(users);
  console.log(`Users seeded: ${users.length}`);
}

function seedVenues(venues: Venue[]): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO venues (
      id, host_id, name, type, city, address, area, capacity, height,
      description, facilities, images, style_images, base_price,
      rating, review_count, status, created_at
    ) VALUES (
      @id, @hostId, @name, @type, @city, @address, @area, @capacity, @height,
      @description, @facilities, @images, @styleImages, @basePrice,
      @rating, @reviewCount, @status, @createdAt
    )
  `);

  const insertMany = db.transaction((list: Venue[]) => {
    for (const venue of list) {
      stmt.run({
        ...venue,
        hostId: venue.hostId,
        facilities: JSON.stringify(venue.facilities),
        images: JSON.stringify(venue.images),
        styleImages: JSON.stringify(venue.styleImages),
        reviewCount: venue.reviewCount,
        basePrice: venue.basePrice,
        createdAt: venue.createdAt || new Date().toISOString(),
      });
    }
  });

  insertMany(venues);
  console.log(`Venues seeded: ${venues.length}`);
}

function seedPriceConfigs(configs: PriceConfig[]): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO price_configs (
      id, venue_id, date, time_slot, price, is_holiday, is_weekend
    ) VALUES (
      @id, @venueId, @date, @timeSlot, @price, @isHoliday, @isWeekend
    )
  `);

  const insertMany = db.transaction((list: PriceConfig[]) => {
    for (const config of list) {
      stmt.run({
        ...config,
        venueId: config.venueId,
        timeSlot: config.timeSlot,
        isHoliday: config.isHoliday ? 1 : 0,
        isWeekend: config.isWeekend ? 1 : 0,
      });
    }
  });

  insertMany(configs);
  console.log(`Price configs seeded: ${configs.length}`);
}

function seedServices(services: Service[]): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO services (
      id, venue_id, name, category, price, unit, description, image
    ) VALUES (
      @id, @venueId, @name, @category, @price, @unit, @description, @image
    )
  `);

  const insertMany = db.transaction((list: Service[]) => {
    for (const service of list) {
      stmt.run({
        ...service,
        venueId: service.venueId,
      });
    }
  });

  insertMany(services);
  console.log(`Services seeded: ${services.length}`);
}

function seedBookings(bookings: Booking[]): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO bookings (
      id, venue_id, user_id, date, time_slot, event_type, estimated_people,
      special_requirements, selected_services, total_amount, deposit,
      status, host_reply, created_at
    ) VALUES (
      @id, @venueId, @userId, @date, @timeSlot, @eventType, @estimatedPeople,
      @specialRequirements, @selectedServices, @totalAmount, @deposit,
      @status, @hostReply, @createdAt
    )
  `);

  const insertMany = db.transaction((list: Booking[]) => {
    for (const booking of list) {
      stmt.run({
        ...booking,
        venueId: booking.venueId,
        userId: booking.userId,
        timeSlot: booking.timeSlot,
        eventType: booking.eventType,
        estimatedPeople: booking.estimatedPeople,
        specialRequirements: booking.specialRequirements || null,
        selectedServices: JSON.stringify(booking.selectedServices),
        totalAmount: booking.totalAmount,
        hostReply: booking.hostReply || null,
        createdAt: booking.createdAt || new Date().toISOString(),
      });
    }
  });

  insertMany(bookings);
  console.log(`Bookings seeded: ${bookings.length}`);
}

function seedReviews(reviews: Review[]): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO reviews (
      id, booking_id, venue_id, user_id, rating, content,
      host_reply, user_reply, created_at
    ) VALUES (
      @id, @bookingId, @venueId, @userId, @rating, @content,
      @hostReply, @userReply, @createdAt
    )
  `);

  const insertMany = db.transaction((list: Review[]) => {
    for (const review of list) {
      stmt.run({
        ...review,
        bookingId: review.bookingId,
        venueId: review.venueId,
        userId: review.userId,
        hostReply: review.hostReply || null,
        userReply: review.userReply || null,
        createdAt: review.createdAt || new Date().toISOString(),
      });
    }
  });

  insertMany(reviews);
  console.log(`Reviews seeded: ${reviews.length}`);
}

export function seed(): void {
  console.log('Starting database seeding...');

  const tx = db.transaction(() => {
    seedUsers(mockUsers);
    seedVenues(mockVenues);
    seedPriceConfigs(mockPriceConfigs);
    seedServices(mockServices);
    seedBookings(mockBookings);
    seedReviews(mockReviews);
  });

  try {
    tx();
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

export function checkSeeded(): boolean {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  return userCount.count > 0;
}

if (process.argv[1] && process.argv[1].includes('seed')) {
  seed();
}
