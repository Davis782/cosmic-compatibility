import { getDb } from './core';
import { Profile } from '../types';

const DUMMY_PROFILES = [
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

export const initializeDummyProfiles = async () => {
  const db = await getDb();
  const result = db.exec("SELECT COUNT(*) as count FROM profiles");
  const count = result[0].values[0][0];
  
  if (count === 0) {
    DUMMY_PROFILES.forEach(profile => {
      db.run(
        'INSERT INTO profiles (name, bio, zodiac, image_url, location) VALUES (?, ?, ?, ?, ?)',
        [profile.name, profile.bio, profile.zodiac, profile.image_url, profile.location]
      );
    });
  }
};

export const updateProfile = async (profileId: number, updates: Partial<Profile>) => {
  const db = await getDb();
  const setClause = Object.keys(updates)
    .map(key => `${key} = ?`)
    .join(', ');
  const values = Object.values(updates);
  
  db.run(
    `UPDATE profiles SET ${setClause} WHERE id = ?`,
    [...values, profileId]
  );
  return true;
};

export const getProfiles = async () => {
  const db = await getDb();
  const result = db.exec(`
    SELECT p.*, 
           (SELECT COUNT(*) 
            FROM profiles p2 
            WHERE p2.id != p.id 
            AND (
              p2.bio LIKE '%' || p.bio || '%' 
              OR p.bio LIKE '%' || p2.bio || '%'
            )) as bio_matches
    FROM profiles p
  `);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map((row: any[]) => {
    const profile: any = {};
    columns.forEach((col, i) => {
      profile[col] = row[i];
    });
    return profile;
  });
};