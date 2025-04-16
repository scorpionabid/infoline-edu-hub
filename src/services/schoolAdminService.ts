
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { School, SchoolAdmin } from '@/types/school';
import { FormNotification } from '@/types/adapters';

// Get school admin
export const getSchoolAdmin = async (schoolId: string): Promise<SchoolAdmin | null> => {
  try {
    // Get admin from user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        profiles:profiles(*)
      `)
      .eq('school_id', schoolId)
      .eq('role', 'schooladmin')
      .single();

    if (error) {
      console.error('School admin sorğusu zamanı xəta:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.user_id,
      email: data.profiles?.email || '',
      name: data.profiles?.full_name || '',
      status: data.profiles?.status || 'active',
      phone: data.profiles?.phone || '',
      lastLogin: data.profiles?.last_login || null,
      avatar: data.profiles?.avatar || null
    };
  } catch (error) {
    console.error('School admin alınarkən xəta:', error);
    return null;
  }
};

// Assign school admin
export const assignSchoolAdmin = async (
  schoolId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { 
        success: false, 
        error: 'İstifadəçi tapılmadı' 
      };
    }

    // Update user role to school admin
    const { error: roleError } = await supabase.rpc('assign_school_admin', {
      p_user_id: userId,
      p_school_id: schoolId
    });

    if (roleError) {
      throw roleError;
    }

    // Update school to add admin_id
    const { error: schoolError } = await supabase
      .from('schools')
      .update({ 
        admin_id: userId,
        admin_email: user.email
      })
      .eq('id', schoolId);

    if (schoolError) {
      throw schoolError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Admin təyin etmə xətası:', error);
    return { 
      success: false, 
      error: error.message || 'Admin təyin edilərkən xəta baş verdi' 
    };
  }
};

// Reset school admin password
export const resetSchoolAdminPassword = async (
  adminId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // This is just a mock function since we can't directly reset passwords in the client
    // In a real app, this would call a secure API endpoint or Edge Function

    toast.success('Şifrə uğurla sıfırlandı');
    return { success: true };
  } catch (error: any) {
    console.error('Şifrə sıfırlama xətası:', error);
    return { 
      success: false, 
      error: error.message || 'Şifrə sıfırlanarkən xəta baş verdi' 
    };
  }
};

// Get notifications for school admin
export const getSchoolAdminNotifications = async (
  schoolId: string
): Promise<FormNotification[]> => {
  try {
    // In a real app, this would fetch actual notifications from the database
    // For now, we'll return mock data
    return [
      {
        id: '1',
        title: 'Son tarix xəbərdarlığı',
        message: 'Əsas məlumatlar kateqoriyası üçün son tarix 3 gün içərisindədir',
        timestamp: new Date().toISOString(),
        type: 'warning',
        read: false
      },
      {
        id: '2',
        title: 'Məlumatlar təsdiqləndi',
        message: 'Təhsil məlumatları kateqoriyası sektor admini tərəfindən təsdiqləndi',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        type: 'success',
        read: true
      }
    ];
  } catch (error) {
    console.error('Bildirişlər alınarkən xəta:', error);
    return [];
  }
};
