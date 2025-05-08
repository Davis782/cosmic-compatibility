
import { getDb } from './core';
import { Profile } from '../types';

const DUMMY_PROFILES = [
  {
    name: 'Alice Johnson',
    bio: 'Love hiking and photography',
    zodiac: 'Libra',
    image_url: '/placeholder.svg',
    location: 'New York, NY',
    zipcode: '10001'
  },
  {
    name: 'Bob Smith',
    bio: 'Coffee enthusiast and tech lover',
    zodiac: 'Taurus',
    image_url: '/placeholder.svg',
    location: 'Los Angeles, CA',
    zipcode: '90001'
  },
  {
    name: 'Carol Davis',
    bio: 'Foodie and travel addict',
    zodiac: 'Gemini',
    image_url: '/placeholder.svg',
    location: 'Chicago, IL',
    zipcode: '60007'
  }
];

export const initializeDummyProfiles = async () => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT COUNT(*) as count FROM profiles");
    const count = result[0].values[0][0];
    
    if (count === 0) {
      console.log("Initializing dummy profiles...");
      DUMMY_PROFILES.forEach(profile => {
        db.run(
          'INSERT INTO profiles (name, bio, zodiac, image_url, location, zipcode) VALUES (?, ?, ?, ?, ?, ?)',
          [profile.name, profile.bio, profile.zodiac, profile.image_url, profile.location, profile.zipcode]
        );
      });
      console.log("Dummy profiles initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing dummy profiles:", error);
  }
};

export const updateProfile = async (profileId: number, updates: Partial<Profile>) => {
  try {
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
  } catch (error) {
    console.error("Error updating profile:", error);
    return false;
  }
};

export const getProfiles = async () => {
  try {
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
  } catch (error) {
    console.error("Error getting profiles:", error);
    return [];
  }
};
