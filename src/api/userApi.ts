
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
    // Handle both notification_settings and notificationSettings
    const updateData = {
      ...userData,
      updated_at: new Date().toISOString(),
    };
    
    // If notificationSettings exists but notification_settings doesn't, copy it over
    if (!updateData.notification_settings && updateData.notificationSettings) {
      updateData.notification_settings = updateData.notificationSettings;
    }
    
    // Update the user's profile in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
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

/**
 * Fetches a user profile by ID
 * @param userId The ID of the user to fetch
 * @returns The user data or null if an error occurred
 */
export const fetchUserProfile = async (userId: string): Promise<FullUserData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data as FullUserData;
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return null;
  }
};
