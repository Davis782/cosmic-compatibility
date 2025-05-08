
import initSqlJs from 'sql.js';

let db: any = null;
let initPromise: Promise<any> | null = null;

export async function initDb() {
  // Return existing database if already initialized
  if (db) return db;
  
  // Return existing initialization promise if in progress
  if (initPromise) return initPromise;
  
  // Create new initialization promise
  initPromise = new Promise(async (resolve, reject) => {
    try {
      // Initialize SQL.js with proper URL
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
          location TEXT,
          zipcode TEXT
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
      
      resolve(db);
    } catch (error) {
      console.error("Database initialization error:", error);
      reject(error);
    }
  });
  
  return initPromise;
}

export const getDb = async () => {
  return await initDb();
};
