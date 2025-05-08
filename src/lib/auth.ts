
import { getDb } from './db/core';
import { Profile } from './types';
import { v4 as uuidv4 } from 'uuid';

// Session management
const SESSION_DURATION_DAYS = 7;

export const registerUser = async (email: string, password: string, profileData: Partial<Profile>): Promise<{success: boolean, message: string, profile?: Profile}> => {
  try {
    const db = await getDb();
    
    // Check if email already exists
    const existingUser = db.exec('SELECT * FROM profiles WHERE email = ?', [email]);
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
      return { success: false, message: 'Email already registered' };
    }
    
    // In a real app, password would be hashed here
    const hashedPassword = password; // Use a proper hashing library in production
    
    // Insert the new profile
    db.run(
      'INSERT INTO profiles (email, password, name, bio, zodiac, image_url, location, zipcode, subscription_tier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        email,
        hashedPassword,
        profileData.name || '', 
        profileData.bio || '', 
        profileData.zodiac || '', 
        profileData.image_url || '/placeholder.svg', 
        profileData.location || '',
        profileData.zipcode || '',
        'basic' // Default tier
      ]
    );
    
    // Get the newly created profile
    const result = db.exec('SELECT * FROM profiles WHERE email = ?', [email]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return { success: false, message: 'Failed to create profile' };
    }
    
    const columns = result[0].columns;
    const row = result[0].values[0];
    
    const profile: any = {};
    columns.forEach((col, i) => {
      profile[col] = row[i];
    });
    
    return { 
      success: true, 
      message: 'Registration successful', 
      profile: profile as Profile 
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: 'Registration failed: ' + (error as Error).message };
  }
};

export const loginUser = async (email: string, password: string): Promise<{success: boolean, message: string, profile?: Profile, token?: string}> => {
  try {
    const db = await getDb();
    
    // Check credentials
    const result = db.exec('SELECT * FROM profiles WHERE email = ? AND password = ?', [email, password]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    const columns = result[0].columns;
    const row = result[0].values[0];
    
    const profile: any = {};
    columns.forEach((col, i) => {
      profile[col] = row[i];
    });
    
    // Create session token
    const token = uuidv4();
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + SESSION_DURATION_DAYS);
    
    // Save session
    db.run(
      'INSERT INTO auth_sessions (profile_id, session_token, expires) VALUES (?, ?, ?)',
      [profile.id, token, expiresDate.toISOString()]
    );
    
    return { 
      success: true, 
      message: 'Login successful', 
      profile: profile as Profile, 
      token 
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: 'Login failed: ' + (error as Error).message };
  }
};

export const logoutUser = async (token: string): Promise<boolean> => {
  try {
    const db = await getDb();
    db.run('DELETE FROM auth_sessions WHERE session_token = ?', [token]);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
};

export const getUserByToken = async (token: string): Promise<Profile | null> => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT p.* 
      FROM profiles p
      JOIN auth_sessions s ON p.id = s.profile_id
      WHERE s.session_token = ? AND s.expires > datetime('now')
    `, [token]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    
    const columns = result[0].columns;
    const row = result[0].values[0];
    
    const profile: any = {};
    columns.forEach((col, i) => {
      profile[col] = row[i];
    });
    
    return profile as Profile;
  } catch (error) {
    console.error("Get user by token error:", error);
    return null;
  }
};

// Simple auth context
let currentUser: Profile | null = null;
let authToken: string | null = null;

export const setCurrentUser = (user: Profile | null, token: string | null) => {
  currentUser = user;
  authToken = token;
  
  if (user && token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getCurrentUser = (): Profile | null => {
  return currentUser;
};

export const getAuthToken = (): string | null => {
  return authToken || localStorage.getItem('authToken');
};

// Initialize auth from localStorage
export const initAuth = async (): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (token) {
    const user = await getUserByToken(token);
    setCurrentUser(user, token);
  }
};
