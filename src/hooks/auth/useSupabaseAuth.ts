
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from './useAuthStore';

/**
 * Hook for direct access to Supabase authentication functionality
 * This provides a simpler API for registration flows
 */
export const useSupabaseAuth = () => {
  const { setError, setUser, setSession } = useAuthStore();
  
  /**
   * Sign up a new user with email and password
   * @param email User email
   * @param password User password
   * @param userData Optional additional user data to be stored in metadata
   */
  const signUp = async (email: string, password: string, userData?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });
      
      if (error) {
        setError(error.message);
        toast.error('Qeydiyyat zamanı xəta baş verdi', {
          description: error.message
        });
        return false;
      }
      
      if (data) {
        toast.success('Qeydiyyat uğurla tamamlandı', {
          description: 'Zəhmət olmasa e-poçtunuzu yoxlayın və hesabınızı təsdiqləyin'
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      setError(error.message);
      toast.error('Qeydiyyat zamanı xəta baş verdi', {
        description: error.message
      });
      return false;
    }
  };
  
  /**
   * Sign in with email and password
   * @param email User email
   * @param password User password
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        return { success: true, data: data.user };
      }
      
      return { success: false, error: 'No session returned' };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };
  
  /**
   * Reset password for a user
   * @param email User email
   */
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };
  
  return {
    signUp,
    signIn,
    resetPassword
  };
};
