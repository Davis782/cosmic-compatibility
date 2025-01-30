import initSqlJs from 'sql.js';

let db: any = null;

export async function initDb() {
  if (db) return db;
  
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

  return db;
}

export const getDb = async () => {
  return await initDb();
};