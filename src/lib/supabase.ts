import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-project-url');
};

// Only create Supabase client if properly configured
export const supabase = isSupabaseConfigured()
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Helper function to get current user profile
export const getCurrentUserProfile = async () => {
  if (!isSupabaseConfigured() || !supabase) return null;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
};

// Helper function to check if user is admin
export const isAdmin = async (): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;
  
  const profile = await getCurrentUserProfile();
  return profile?.role === 'admin';
};