export interface Report {
  id: string;
  user_id: string;
  raw_text: string;
  clean_text: string | null;
  category: string | null;
  status: 'pending' | 'reviewed' | 'resolved';
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  created_at: string;
  votes_count: number;
  user_has_voted: boolean;
}