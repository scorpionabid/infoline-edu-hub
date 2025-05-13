
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/user';

/**
 * Updates a user profile in the database
 * @param userId The ID of the user to update
 * @param userData Partial user data to update
 * @returns The updated user data or null if an error occurred
 */
export const updateUserProfile = async (userId: string, userData: Partial<FullUserData>) => {
  try {
    // Update the user's profile in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
