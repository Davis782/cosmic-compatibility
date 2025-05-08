
export type Profile = {
  id: number;
  name: string;
  bio: string;
  zodiac: string;
  image_url: string;
  location: string;
  zipcode?: string;
  email?: string;
  password?: string;
  financial_status?: string;
  education_level?: string;
  hobbies?: string;
  verified?: boolean;
  verification_type?: string;
  subscription_tier?: 'basic' | 'premium' | 'elite';
  personality_type?: string;
  bio_matches?: number;
  is_bio_match?: boolean;
  created_at?: string;
};

export type Match = {
  id: number;
  profile1_id: number;
  profile2_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  compatibility_score?: number;
  compatibility_details?: string;
  created_at?: string;
};

export type Event = {
  id: number;
  title: string;
  description?: string;
  event_type?: string;
  location: string;
  date: Date;
  distance?: string;
  coordinates?: [number, number];
  is_virtual?: boolean;
  is_premium?: boolean;
  max_participants?: number;
  created_at?: string;
};

export type Message = {
  id: number;
  content: string;
  sender_id: number;
  match_id: number;
  timestamp: string;
  read?: boolean;
};

export type AuthSession = {
  id: number;
  profile_id: number;
  session_token: string;
  expires: string;
};

export type EventParticipant = {
  id: number;
  event_id: number;
  profile_id: number;
  status: 'registered' | 'attended' | 'cancelled';
};

export type SubscriptionTier = 'basic' | 'premium' | 'elite';

export type ZodiacSign = 
  'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 
  'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 
  'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type CompatibilityResult = {
  score: number;
  details: {
    zodiac: number;
    interests: number;
    personality: number;
    lifestyle: number;
  };
  explanation: string;
};
