
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserCreateData, UpdateUserData } from '@/types/user';

export const userService = {
  async createUser(userData: UserCreateData): Promise<FullUserData> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return data as FullUserData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(userId: string, updates: UpdateUserData): Promise<FullUserData> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as FullUserData;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async getUserById(userId: string): Promise<FullUserData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as FullUserData;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
};
