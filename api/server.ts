/**
 * local server entry file, for local development
 */
import app from './app.js';
import db from './db.js';
import { seed, checkSeeded } from './seed.js';

try {
  console.log('Database initialized');
  if (!checkSeeded()) {
    console.log('Seeding initial data...');
    seed();
  } else {
    console.log('Database already seeded, skipping...');
  }
} catch (error) {
  console.error('Database initialization error:', error);
}

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;