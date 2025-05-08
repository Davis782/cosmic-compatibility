
import { getDb } from './core';

export const createMatch = async (profile1Id: number, profile2Id: number) => {
  try {
    const db = await getDb();
    db.run('INSERT INTO matches (profile1_id, profile2_id) VALUES (?, ?)', [profile1Id, profile2Id]);
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
