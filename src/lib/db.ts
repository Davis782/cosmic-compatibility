import initSqlJs from 'sql.js';

let db: any = null;

async function initDb() {
  if (db) return;
  
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  db = new SQL.Database();
  
  // Initialize tables
  db.run(`
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
  const result = db.exec("SELECT COUNT(*) as count FROM profiles");
  const count = result[0].values[0][0];
  
  if (count === 0) {
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

    dummyProfiles.forEach(profile => {
      db.run(
        'INSERT INTO profiles (name, bio, zodiac, image_url, location) VALUES (?, ?, ?, ?, ?)',
        [profile.name, profile.bio, profile.zodiac, profile.image_url, profile.location]
      );
    });
  }
}

// Initialize DB when module loads
initDb().catch(console.error);

export const updateProfile = async (profileId: number, updates: Partial<Profile>) => {
  await initDb();
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
  await initDb();
  const result = db.exec('SELECT * FROM profiles');
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

export const createMatch = async (profile1Id: number, profile2Id: number) => {
  await initDb();
  db.run('INSERT INTO matches (profile1_id, profile2_id) VALUES (?, ?)', [profile1Id, profile2Id]);
  return true;
};

export const getMatches = async (profileId: number) => {
  await initDb();
  const result = db.exec(`
    SELECT m.*, p.* FROM matches m 
    JOIN profiles p ON (m.profile1_id = p.id OR m.profile2_id = p.id)
    WHERE (m.profile1_id = ? OR m.profile2_id = ?) AND p.id != ?
  `, [profileId, profileId, profileId]);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map((row: any[]) => {
    const match: any = {};
    columns.forEach((col, i) => {
      match[col] = row[i];
    });
    return match;
  });
};

export const getMessages = async (matchId: number) => {
  await initDb();
  const result = db.exec(
    `SELECT * FROM messages 
     WHERE match_id = ? 
     ORDER BY timestamp DESC 
     LIMIT 50`,
    [matchId]
  );

  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map((row: any[]) => {
    const message: any = {};
    columns.forEach((col, i) => {
      message[col] = row[i];
    });
    return message;
  });
};

export const sendMessage = async ({
  matchId,
  senderId,
  content
}: {
  matchId: number;
  senderId: number;
  content: string;
}) => {
  await initDb();
  db.run(
    `INSERT INTO messages (match_id, sender_id, content) 
     VALUES (?, ?, ?)`,
    [matchId, senderId, content]
  );

  const result = db.exec(
    "SELECT * FROM messages WHERE match_id = ? ORDER BY id DESC LIMIT 1",
    [matchId]
  );

  if (result.length === 0 || !result[0].values.length) return null;

  const columns = result[0].columns;
  const row = result[0].values[0];
  const message: any = {};
  columns.forEach((col, i) => {
    message[col] = row[i];
  });
  return message;
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

export type Event = {
  id: number;
  title: string;
  location: string;
  date: Date;
  distance: string;
};
