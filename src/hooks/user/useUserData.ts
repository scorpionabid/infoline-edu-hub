
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useAuth } from '@/context/auth';
import { FullUserData, User, UserRole } from '@/types/user';
import { toast } from 'sonner';

export const useUserData = () => {
  const { user: authUser } = useAuth();
  const { userRole } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userData, setUserData] = useState<FullUserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) throw profileError;

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*, regions(name), sectors(name), schools(name)')
          .eq('user_id', authUser.id)
          .single();

        if (roleError) throw roleError;

        // Combine data
        const fullUserData: FullUserData = {
          id: authUser.id,
          email: authUser.email || '',
          full_name: profileData?.full_name || '',
          role: roleData?.role as UserRole,
          status: profileData?.status || 'active',
          phone: profileData?.phone || '',
          language: profileData?.language || 'az',
          position: profileData?.position || '',
          avatar: profileData?.avatar || '',
          created_at: profileData?.created_at,
          updated_at: profileData?.updated_at,
          last_login: profileData?.last_login,
          region_id: roleData?.region_id || '',
          sector_id: roleData?.sector_id || '',
          school_id: roleData?.school_id || '',
          region_name: roleData?.regions?.name || '',
          sector_name: roleData?.sectors?.name || '',
          school_name: roleData?.schools?.name || '',
          entityName: {
            region: roleData?.regions?.name || '',
            sector: roleData?.sectors?.name || '',
            school: roleData?.schools?.name || ''
          }
        };

        setUserData(fullUserData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser?.id]);

  return { userData, loading, error };
};

// Exported function to fetch admin entity data
export const fetchAdminEntityData = async (id: string, role: UserRole) => {
  try {
    if (role === 'regionadmin') {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('admin_id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
    
    if (role === 'sectoradmin') {
      const { data, error } = await supabase
        .from('sectors')
        .select('*, regions(name)')
        .eq('admin_id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
    
    if (role === 'schooladmin') {
      const { data, error } = await supabase
        .from('schools')
        .select('*, regions(name), sectors(name)')
        .eq('admin_id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
    
    return null;
  } catch (err) {
    console.error('Error fetching admin entity data:', err);
    return null;
  }
};

// Exported function to format user data
export const formatUserData = (user: any, entityData: any = null): FullUserData => {
  const formattedUser: FullUserData = {
    id: user.id || '',
    email: user.email || '',
    full_name: user.full_name || user.name || '',
    role: user.role || 'user',
    status: user.status || 'active',
    phone: user.phone || '',
    language: user.language || 'az',
    position: user.position || '',
    created_at: user.created_at || '',
    updated_at: user.updated_at || ''
  };
  
  // Add entity information if available
  if (entityData) {
    if (user.role === 'regionadmin') {
      formattedUser.region_id = entityData.id;
      formattedUser.region_name = entityData.name;
    }
    
    if (user.role === 'sectoradmin') {
      formattedUser.sector_id = entityData.id;
      formattedUser.sector_name = entityData.name;
      formattedUser.region_id = entityData.region_id;
      formattedUser.region_name = entityData.regions?.name;
    }
    
    if (user.role === 'schooladmin') {
      formattedUser.school_id = entityData.id;
      formattedUser.school_name = entityData.name;
      formattedUser.sector_id = entityData.sector_id;
      formattedUser.sector_name = entityData.sectors?.name;
      formattedUser.region_id = entityData.region_id;
      formattedUser.region_name = entityData.regions?.name;
    }
  }
  
  return formattedUser;
};

export default useUserData;
