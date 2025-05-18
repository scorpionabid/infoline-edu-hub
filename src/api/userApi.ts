
import { supabase } from '@/integrations/supabase/client';
import { UserRole, normalizeRole } from '@/types/role';
import { FullUserData, UserStatus } from '@/types/user';

export async function fetchUserProfile(userId: string): Promise<FullUserData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Also get the user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (roleError && roleError.code !== 'PGRST116') {
      console.error('Error fetching user role:', roleError);
    }
    
    // Create the full user data
    return {
      ...data,
      role: normalizeRole(roleData?.role) || 'user',
      status: (data.status as UserStatus) || 'active',
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, data: Partial<FullUserData>) {
  try {
    // First, update the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.phone,
        position: data.position,
        language: data.language,
        avatar_url: data.avatar_url || data.avatar, // Use either avatar_url or avatar
        status: data.status,
      })
      .eq('id', userId);
    
    if (profileError) throw profileError;
    
    // Then, if role is provided, update the user role
    if (data.role) {
      // Normalize the role to ensure it's a valid role
      const normalizedRole = normalizeRole(data.role);
      
      // Upsert to user_roles table with user_id field
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: normalizedRole,
        });
      
      if (roleError) throw roleError;
    }
    
    return { data: true, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}
