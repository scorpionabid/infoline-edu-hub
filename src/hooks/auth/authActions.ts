import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FullUserData } from '@/types/supabase';
import { fetchUserData } from './userDataService';

/**
 * İstifadəçi giriş funksiyası
 */
export const signIn = async (
  email: string, 
  password: string, 
  setLoading: (loading: boolean) => void
) => {
  try {
    console.log(`signIn: ${email} ilə giriş edilir...`);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('signIn xətası:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

/**
 * İstifadəçi çıxış funksiyası
 */
export const signOut = async (
  setLoading: (loading: boolean) => void, 
  setUser: (user: FullUserData | null) => void,
  setSession: (session: any | null) => void
) => {
  try {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  } catch (error) {
    console.error('signOut xətası:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

/**
 * İstifadəçi qeydiyyat funksiyası
 */
export const signUp = async (
  email: string, 
  password: string, 
  userData: any, 
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('signUp xətası:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

/**
 * Şifrə sıfırlama funksiyası
 */
export const resetPassword = async (
  email: string, 
  setLoading: (loading: boolean) => void
) => {
  try {
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('resetPassword xətası:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

/**
 * Şifrə yeniləmə funksiyası
 */
export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('updatePassword xətası:', error);
    throw error;
  }
};

/**
 * Profil yeniləmə funksiyası
 */
export const updateProfile = async (
  updates: any, 
  userId: string, 
  fetchUserDataFn: (userId: string) => Promise<FullUserData | null>, 
  setUser: (user: FullUserData | null) => void
) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    
    const userData = await fetchUserDataFn(userId);
    
    if (userData) {
      setUser(userData);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('updateProfile xətası:', error);
    throw error;
  }
};

/**
 * Sessiya yoxlama funksiyası
 */
export const checkSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Sessiya yoxlanması zamanı xəta:', error);
      return { session: null, error };
    }
    
    return { session: data.session, error: null };
  } catch (error) {
    console.error('Sessiya yoxlanmasında gözlənilməz xəta:', error);
    return { session: null, error };
  }
};

/**
 * İstifadəçi məlumatlarını yeniləmə funksiyası
 */
export const refreshUserData = async (
  userId: string,
  setUser: (user: FullUserData | null) => void
) => {
  try {
    const userData = await fetchUserData(userId);
    setUser(userData);
    return userData;
  } catch (error) {
    console.error('İstifadəçi məlumatlarını yeniləmə xətası:', error);
    return null;
  }
};
