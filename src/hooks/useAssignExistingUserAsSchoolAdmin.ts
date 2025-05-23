
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAssignExistingUserAsSchoolAdmin = () => {
  const [loading, setLoading] = useState(false);

  const assignUserAsSchoolAdmin = async (schoolId: string, userId: string) => {
    setLoading(true);
    try {
      // Update user role in user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'schooladmin',
          school_id: schoolId
        });

      if (roleError) throw roleError;

      // Update school admin_id
      const { error: schoolError } = await supabase
        .from('schools')
        .update({ admin_id: userId })
        .eq('id', schoolId);

      if (schoolError) throw schoolError;

      toast.success('User assigned as school admin successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(`Failed to assign admin: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    assignUserAsSchoolAdmin,
    loading
  };
};

export default useAssignExistingUserAsSchoolAdmin;
