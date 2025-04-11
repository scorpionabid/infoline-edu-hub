
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Environment dəyişənlərini əldə et
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://olbfnauhzpdskqnxtwav.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL və ya Anon Key tapılmadı. Ətraf dəyişənlər düzgün konfiqurasiya edilməlidir.');
}

// Supabase müştərisini yaradırıq
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: localStorage,
    }
  }
);

// Supabase istifadəçi məlumatlarını əldə etmək üçün köməkçi funksiya
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('İstifadəçi məlumatları əldə edilərkən xəta:', error);
    return null;
  }
};

// Supabase sessiya məlumatlarını əldə etmək üçün köməkçi funksiya
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Sessiya məlumatları əldə edilərkən xəta:', error);
    return null;
  }
};
