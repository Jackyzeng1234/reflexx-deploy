import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
});

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          test_type: string;
          score: number;
          details?: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_type: string;
          score: number;
          details?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          test_type?: string;
          score?: number;
          details?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}

// 类型帮助函数
type Profiles = Database['public']['Tables']['profiles'];
type Scores = Database['public']['Tables']['scores'];

export type Profile = Profiles['Row'];
export type Score = Scores['Row'];
export type ScoreInsert = Scores['Insert'];
export type ProfileInsert = Profiles['Insert'];
