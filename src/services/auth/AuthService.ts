import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/user';

export class AuthService {
  static async signUpWithEmailAndPassword(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split('@')[0],
          }
        }
      });

      if (error) {
        throw error;
      }

      return {
        user: data.user,
        session: data.session,
        error: null
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  static async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        // password
      });

      const { data, error } = result;

      if (error) {
        throw error;
      }

      return {
        user: data.session?.user,
        session: data.session,
        error: null
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      return {
        error: null
      };
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static async resetPasswordForEmail(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      return {
        error: null
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return {
        user: data.user,
        error: null
      };
    } catch (error: any) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  static async getUser() {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (error: any) {
      console.error('Get user error:', error);
      return null;
    }
  }

  static async getSession() {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (error: any) {
      console.error('Get session error:', error);
      return null;
    }
  }

  static async updateUserProfile(updates: Partial<FullUserData>) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Remove notification_settings if it exists in updates
      const { ...validUpdates } = updates;

      const { data, error } = await supabase
        .from('profiles')
        .update(validUpdates)
        .eq('id', user.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}
