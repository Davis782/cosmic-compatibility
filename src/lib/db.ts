export * from './db/core';
export * from './db/profiles';
export * from './db/matches';
export * from './db/messages';
export * from './types';

// Initialize DB when module loads
import { initDb } from './db/core';
import { initializeDummyProfiles } from './db/profiles';

// Initialize database and dummy data
initDb()
  .then(() => initializeDummyProfiles())
  .catch(console.error);