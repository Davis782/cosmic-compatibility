
import { getDb } from './core';
import { Match, Profile } from '../types';

export const createMatch = async (profile1Id: number, profile2Id: number) => {
  try {
    const db = await getDb();
    
    // Calculate a simple compatibility score (would be more complex in a real app)
    const profile1 = await getProfileById(profile1Id);
    const profile2 = await getProfileById(profile2Id);
    
    let compatibilityScore = 50; // Base score
    let compatibilityDetails = {};
    
    // Add zodiac compatibility
    if (profile1?.zodiac && profile2?.zodiac) {
      const zodiacScore = calculateZodiacCompatibility(profile1.zodiac, profile2.zodiac);
      compatibilityScore += zodiacScore;
      compatibilityDetails = { ...compatibilityDetails, zodiac: zodiacScore };
    }
    
    // Add bio text similarity
    if (profile1?.bio && profile2?.bio) {
      const bioMatch = (profile1.bio.includes(profile2.bio) || profile2.bio.includes(profile1.bio));
      if (bioMatch) {
        compatibilityScore += 10;
        compatibilityDetails = { ...compatibilityDetails, interests: 10 };
      }
    }
    
    db.run('INSERT INTO matches (profile1_id, profile2_id, compatibility_score, compatibility_details) VALUES (?, ?, ?, ?)', 
      [profile1Id, profile2Id, compatibilityScore, JSON.stringify(compatibilityDetails)]);
    return true;
  } catch (error) {
    console.error("Error creating match:", error);
    return false;
  }
};

export const getMatches = async (profileId: number) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT 
        m.*,
        p.*,
        (p.bio LIKE '%' || (SELECT bio FROM profiles WHERE id = ?) || '%' 
         OR (SELECT bio FROM profiles WHERE id = ?) LIKE '%' || p.bio || '%') as is_bio_match
      FROM matches m 
      JOIN profiles p ON (m.profile1_id = p.id OR m.profile2_id = p.id)
      WHERE (m.profile1_id = ? OR m.profile2_id = ?) AND p.id != ?
    `, [profileId, profileId, profileId, profileId, profileId]);
    
    if (result.length === 0) return [];
    
    console.log("Matches query result:", result);
    
    const columns = result[0].columns;
    return result[0].values.map((row: any[]) => {
      const match: any = {};
      columns.forEach((col, i) => {
        match[col] = row[i];
      });
      return match;
    });
  } catch (error) {
    console.error("Error getting matches:", error);
    return [];
  }
};

export const deleteMatch = async (matchId: number) => {
  try {
    const db = await getDb();
    
    // First, delete all messages related to this match
    db.run('DELETE FROM messages WHERE match_id = ?', [matchId]);
    
    // Then delete the match itself
    db.run('DELETE FROM matches WHERE id = ?', [matchId]);
    
    return true;
  } catch (error) {
    console.error("Error deleting match:", error);
    return false;
  }
};

export const updateMatchStatus = async (matchId: number, status: 'pending' | 'accepted' | 'rejected') => {
  try {
    const db = await getDb();
    db.run('UPDATE matches SET status = ? WHERE id = ?', [status, matchId]);
    return true;
  } catch (error) {
    console.error("Error updating match status:", error);
    return false;
  }
};

// Helper functions
const getProfileById = async (profileId: number): Promise<Profile | null> => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT * FROM profiles WHERE id = ?', [profileId]);
    
    if (result.length === 0 || result[0].values.length === 0) return null;
    
    const columns = result[0].columns;
    const row = result[0].values[0];
    
    const profile: any = {};
    columns.forEach((col, i) => {
      profile[col] = row[i];
    });
    
    return profile as Profile;
  } catch (error) {
    console.error("Error getting profile by ID:", error);
    return null;
  }
};

const calculateZodiacCompatibility = (sign1: string, sign2: string): number => {
  // Simplified zodiac compatibility calculation
  const compatibilityMap: {[key: string]: string[]} = {
    'Aries': ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    'Taurus': ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    'Gemini': ['Libra', 'Aquarius', 'Aries', 'Leo'],
    'Cancer': ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    'Leo': ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    'Virgo': ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    'Libra': ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    'Scorpio': ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    'Sagittarius': ['Aries', 'Leo', 'Libra', 'Aquarius'],
    'Capricorn': ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    'Aquarius': ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    'Pisces': ['Cancer', 'Scorpio', 'Taurus', 'Capricorn']
  };
  
  // Normalize inputs
  const normalizedSign1 = sign1.charAt(0).toUpperCase() + sign1.slice(1).toLowerCase();
  const normalizedSign2 = sign2.charAt(0).toUpperCase() + sign2.slice(1).toLowerCase();
  
  // Check compatibility
  if (normalizedSign1 === normalizedSign2) return 20; // Same sign
  if (compatibilityMap[normalizedSign1]?.includes(normalizedSign2)) return 15; // Compatible
  return 5; // Not particularly compatible
};
