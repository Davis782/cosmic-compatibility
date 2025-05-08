
export type Profile = {
  id: number;
  name: string;
  bio: string;
  zodiac: string;
  image_url: string;
  location: string;
  zipcode?: string;
  bio_matches?: number;
  is_bio_match?: boolean;
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
  coordinates: [number, number];
};

export type Message = {
  id: number;
  content: string;
  sender_id: number;
  match_id: number;
  timestamp: string;
};
