
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserFormData {
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  position?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
}

export const useCreateUser = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: UserFormData) => {
    setIsLoading(true);
    try {
      // Create user in auth.users (simplified - you may need edge function for full implementation)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: 'temporary123', // You should generate a proper temporary password
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      });

      if (authError) throw authError;

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone,
          position: userData.position,
          language: userData.language || 'az'
        });

      if (profileError) throw profileError;

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authUser.user.id,
          role: userData.role,
          region_id: userData.region_id,
          sector_id: userData.sector_id,
          school_id: userData.school_id
        });

      if (roleError) throw roleError;

      toast.success('İstifadəçi uğurla yaradıldı');
      return authUser.user;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'İstifadəçi yaradılarkən xəta baş verdi');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUser,
    isLoading
  };
};
