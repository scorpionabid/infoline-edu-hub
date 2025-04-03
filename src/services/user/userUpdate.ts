
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UpdateUserData } from '@/types/supabase';
import { getUserById } from './userFetch';

export const updateUser = async (userId: string, userData: UpdateUserData): Promise<FullUserData | null> => {
  try {
    // First, get the current user data
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Prepare the updated data for the profiles table
    const profilesData: any = {};

    // Only add fields that have changed
    if (userData.full_name !== undefined) profilesData.full_name = userData.full_name;
    if (userData.avatar !== undefined) profilesData.avatar = userData.avatar;
    if (userData.phone !== undefined) profilesData.phone = userData.phone;
    if (userData.position !== undefined) profilesData.position = userData.position;
    if (userData.language !== undefined) profilesData.language = userData.language;
    if (userData.status !== undefined) profilesData.status = userData.status;

    // Update the profiles table if there are changes
    if (Object.keys(profilesData).length > 0) {
      const { error: profilesError } = await supabase
        .from('profiles')
        .update(profilesData)
        .eq('id', userId);

      if (profilesError) {
        throw profilesError;
      }
    }

    // Update the user_roles table if role or related IDs have changed
    if (userData.role !== undefined || 
        userData.region_id !== undefined || 
        userData.sector_id !== undefined || 
        userData.school_id !== undefined) {

      const userRoleData: any = {};
      if (userData.role !== undefined) userRoleData.role = userData.role;
      if (userData.region_id !== undefined) userRoleData.region_id = userData.region_id;
      if (userData.sector_id !== undefined) userRoleData.sector_id = userData.sector_id;
      if (userData.school_id !== undefined) userRoleData.school_id = userData.school_id;

      // Check if user_role entry exists
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select()
        .eq('user_id', userId);

      if (roleCheckError) {
        throw roleCheckError;
      }

      if (existingRole && existingRole.length > 0) {
        // Update existing role
        const { error: roleUpdateError } = await supabase
          .from('user_roles')
          .update(userRoleData)
          .eq('user_id', userId);

        if (roleUpdateError) {
          throw roleUpdateError;
        }
      } else {
        // Insert new role
        userRoleData.user_id = userId;
        const { error: roleInsertError } = await supabase
          .from('user_roles')
          .insert(userRoleData);

        if (roleInsertError) {
          throw roleInsertError;
        }
      }
    }

    // Update auth user if email or password is changed
    if (userData.email !== undefined || userData.password !== undefined) {
      const authUpdateData: any = {};
      if (userData.email !== undefined) authUpdateData.email = userData.email;
      if (userData.password !== undefined) authUpdateData.password = userData.password;

      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        userId,
        authUpdateData
      );

      if (authUpdateError) {
        throw authUpdateError;
      }
    }

    // Fetch and return the updated user
    return await getUserById(userId);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const createUser = async (userData: FullUserData & { password: string }): Promise<FullUserData | null> => {
  try {
    // Create the user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name
      }
    });
    
    if (authError) {
      throw authError;
    }
    
    const userId = authData.user.id;
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: userData.full_name,
        avatar: userData.avatar || null,
        phone: userData.phone || null,
        position: userData.position || null,
        language: userData.language || 'az',
        status: userData.status || 'active'
      });
      
    if (profileError) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(userId);
      throw profileError;
    }
    
    // Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: userData.role,
        region_id: userData.region_id || null,
        sector_id: userData.sector_id || null,
        school_id: userData.school_id || null
      });
      
    if (roleError) {
      // Rollback: delete the auth user and profile
      await supabase.auth.admin.deleteUser(userId);
      throw roleError;
    }
    
    // Fetch and return the created user
    return await getUserById(userId);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
