
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useSupabaseAuth() {
  const [loading, setLoading] = useState(false);

  /**
   * Sign up a new user with email and password
   */
  const signUp = async (email: string, password: string, userData: any = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message);
        return false;
      }

      if (data) {
        toast.success('Qeydiyyat uğurla tamamlandı');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast.error(error.message || 'Qeydiyyat zamanı xəta baş verdi');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in an existing user with email and password
   */
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        return false;
      }

      if (data.session) {
        toast.success('Uğurla daxil oldunuz');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      toast.error(error.message || 'Daxil olarkən xəta baş verdi');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signUp,
    signIn
  };
}

export default useSupabaseAuth;
