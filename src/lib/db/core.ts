
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
      console.log("Initializing SQL.js...");
      // Initialize SQL.js with proper URL
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      console.log("SQL.js initialized, creating database...");
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
          zipcode TEXT,
          email TEXT UNIQUE,
          password TEXT,
          financial_status TEXT,
          education_level TEXT,
          hobbies TEXT,
          verified BOOLEAN DEFAULT 0,
          verification_type TEXT,
          subscription_tier TEXT DEFAULT 'basic',
          personality_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS matches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile1_id INTEGER,
          profile2_id INTEGER,
          status TEXT DEFAULT 'pending',
          compatibility_score INTEGER,
          compatibility_details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile1_id) REFERENCES profiles (id),
          FOREIGN KEY (profile2_id) REFERENCES profiles (id)
        );

        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          match_id INTEGER,
          sender_id INTEGER,
          content TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          read BOOLEAN DEFAULT 0,
          FOREIGN KEY (match_id) REFERENCES matches (id),
          FOREIGN KEY (sender_id) REFERENCES profiles (id)
        );

        CREATE TABLE IF NOT EXISTS auth_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id INTEGER,
          session_token TEXT UNIQUE,
          expires DATETIME,
          FOREIGN KEY (profile_id) REFERENCES profiles (id)
        );

        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          event_type TEXT,
          location TEXT,
          date DATETIME,
          is_virtual BOOLEAN DEFAULT 0,
          is_premium BOOLEAN DEFAULT 0,
          max_participants INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS event_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER,
          profile_id INTEGER,
          status TEXT DEFAULT 'registered',
          FOREIGN KEY (event_id) REFERENCES events (id),
          FOREIGN KEY (profile_id) REFERENCES profiles (id)
        );
      `);
      
      console.log("Database tables created successfully");
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
