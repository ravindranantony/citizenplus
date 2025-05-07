export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: 'citizen' | 'moderator' | 'admin';
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          role?: 'citizen' | 'moderator' | 'admin';
          points?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: 'citizen' | 'moderator' | 'admin';
          points?: number;
          created_at?: string;
        };
      };
      reports: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          raw_text: string;
          clean_text?: string | null;
          category?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved';
          latitude?: number | null;
          longitude?: number | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          raw_text?: string;
          clean_text?: string | null;
          category?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved';
          latitude?: number | null;
          longitude?: number | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          report_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          report_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          report_id?: string;
          created_at?: string;
        };
      };
    };
  };
}