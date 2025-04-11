
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Environment dəyişənlərini əldə et
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL və ya Anon Key tapılmadı. Ətraf dəyişənlər düzgün konfiqurasiya edilməlidir.');
}

// Supabase müştərisini yaradırıq
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
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
