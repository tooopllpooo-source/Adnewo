import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Reverted to the standard Supabase client initialization.
// The previous custom fetch with a proxy caused the dev server to crash
// due to environment variable constraints. The underlying CORS issue
// must be resolved in the Supabase dashboard settings.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// أنواع البيانات لـ Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      api_credentials: {
        Row: {
          id: string;
          user_id: string;
          api_key_encrypted: string;
          publisher_id: string;
          endpoint: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          api_key_encrypted: string;
          publisher_id: string;
          endpoint?: string;
          is_active?: boolean;
        };
        Update: {
          api_key_encrypted?: string;
          publisher_id?: string;
          endpoint?: string;
          is_active?: boolean;
        };
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          url: string;
          cpm: number;
          country: string;
          device: 'mobile' | 'desktop' | 'all';
          category: string;
          status: 'active' | 'paused' | 'expired';
          impressions: number;
          clicks: number;
          revenue: number;
          is_selected: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          url: string;
          cpm: number;
          country: string;
          device: 'mobile' | 'desktop' | 'all';
          category: string;
          status: 'active' | 'paused' | 'expired';
          impressions?: number;
          clicks?: number;
          revenue?: number;
          is_selected?: boolean;
        };
        Update: {
          name?: string;
          url?: string;
          cpm?: number;
          country?: string;
          device?: 'mobile' | 'desktop' | 'all';
          category?: string;
          status?: 'active' | 'paused' | 'expired';
          impressions?: number;
          clicks?: number;
          revenue?: number;
          is_selected?: boolean;
        };
      };
      generated_scripts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          script_code: string;
          config: any;
          campaign_ids: string[];
          script_type: 'production' | 'preview';
          created_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          script_code: string;
          config: any;
          campaign_ids: string[];
          script_type: 'production' | 'preview';
        };
        Update: {
          name?: string;
          script_code?: string;
          config?: any;
          campaign_ids?: string[];
          script_type?: 'production' | 'preview';
        };
      };
    };
  };
}
