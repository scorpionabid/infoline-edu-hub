
import { supabase } from '@/integrations/supabase/client';
import { UserRole, normalizeRole } from '@/types/role';
import { FullUserData, UserStatus } from '@/types/auth';
import { toast } from 'sonner';

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
        avatar: data.avatar,
        status: data.status,
      })
      .eq('id', userId);
    
    if (profileError) throw profileError;
    
    // If role or entity IDs are included, update the user role
    if (data.role || data.region_id || data.sector_id || data.school_id) {
      // Convert the role to string for database storage
      const roleValue = data.role ? String(data.role) : undefined;
      
      // Check if the user role exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (existingRole) {
        // Update existing role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({
            role: roleValue as any, // Type casting to avoid TS errors
            region_id: data.region_id || null,
            sector_id: data.sector_id || null,
            school_id: data.school_id || null,
          })
          .eq('user_id', userId);
          
        if (roleError) throw roleError;
      } else {
        // Insert new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: roleValue as any, // Type casting to avoid TS errors
            region_id: data.region_id || null,
            sector_id: data.sector_id || null,
            school_id: data.school_id || null,
          });
          
        if (roleError) throw roleError;
      }
    }
    
    toast.success('Profile updated successfully');
    return { data: true, error: null };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    toast.error('Failed to update profile: ' + error.message);
    return { data: null, error };
  }
}

export async function createUser(userData: any) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
      },
    });
    
    if (authError) throw authError;
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        position: userData.position,
        language: userData.language || 'az',
        status: userData.status || 'active',
      });
    
    if (profileError) throw profileError;
    
    // Convert UserRole to string for the database
    const roleValue = userData.role ? String(userData.role) : 'user';
    
    // Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: roleValue as any, // Type casting to avoid TS errors
        region_id: userData.region_id || null,
        sector_id: userData.sector_id || null,
        school_id: userData.school_id || null,
      });
    
    if (roleError) throw roleError;
    
    toast.success('User created successfully');
    return { data: authData.user, error: null };
  } catch (error: any) {
    console.error('Error creating user:', error);
    toast.error('Failed to create user: ' + error.message);
    return { data: null, error };
  }
}
