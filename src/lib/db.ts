import Database from 'better-sqlite3';
import { join } from 'path';

const db = new Database('dating.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bio TEXT,
    zodiac TEXT,
    image_url TEXT,
    location TEXT
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile1_id INTEGER,
    profile2_id INTEGER,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (profile1_id) REFERENCES profiles (id),
    FOREIGN KEY (profile2_id) REFERENCES profiles (id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER,
    sender_id INTEGER,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches (id),
    FOREIGN KEY (sender_id) REFERENCES profiles (id)
  );
`);

// Insert dummy data if the profiles table is empty
const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get();
if (profileCount.count === 0) {
  const dummyProfiles = [
    {
      name: 'Alice Johnson',
      bio: 'Love hiking and photography',
      zodiac: 'Libra',
      image_url: '/placeholder.svg',
      location: 'New York, NY'
    },
    {
      name: 'Bob Smith',
      bio: 'Coffee enthusiast and tech lover',
      zodiac: 'Taurus',
      image_url: '/placeholder.svg',
      location: 'Los Angeles, CA'
    },
    {
      name: 'Carol Davis',
      bio: 'Foodie and travel addict',
      zodiac: 'Gemini',
      image_url: '/placeholder.svg',
      location: 'Chicago, IL'
    }
  ];

  const insertProfile = db.prepare(
    'INSERT INTO profiles (name, bio, zodiac, image_url, location) VALUES (?, ?, ?, ?, ?)'
  );

  dummyProfiles.forEach(profile => {
    insertProfile.run(profile.name, profile.bio, profile.zodiac, profile.image_url, profile.location);
  });
}

// Database queries
export const getProfiles = () => {
  return db.prepare('SELECT * FROM profiles').all();
};

export const createMatch = (profile1Id: number, profile2Id: number) => {
  return db.prepare('INSERT INTO matches (profile1_id, profile2_id) VALUES (?, ?)').run(profile1Id, profile2Id);
};

export const getMatches = (profileId: number) => {
  return db.prepare(`
    SELECT m.*, p.* FROM matches m 
    JOIN profiles p ON (m.profile1_id = p.id OR m.profile2_id = p.id)
    WHERE (m.profile1_id = ? OR m.profile2_id = ?) AND p.id != ?
  `).all(profileId, profileId, profileId);
};

export type Profile = {
  id: number;
  name: string;
  bio: string;
  zodiac: string;
  image_url: string;
  location: string;
};

export type Match = {
  id: number;
  profile1_id: number;
  profile2_id: number;
  status: 'pending' | 'accepted' | 'rejected';
};