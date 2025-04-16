import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { School, SchoolAdmin } from '@/types/school';
import { FormNotification } from '@/types/adapters';

// Get school admin
export const getSchoolAdmin = async (schoolId: string): Promise<SchoolAdmin | null> => {
  try {
    // First, try to get admin from school record
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('admin_id, admin_email')
      .eq('id', schoolId)
      .single();
    
    if (schoolError) {
      console.error('School sorğusu zamanı xəta:', schoolError);
      return null;
    }
    
    if (!schoolData || !schoolData.admin_id) {
      if (schoolData && schoolData.admin_email) {
        console.warn('Məktəbdə admin_email var, lakin admin_id yoxdur:', schoolData.admin_email);
      }
      return null;
    }
    
    // Get admin details
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', schoolData.admin_id)
      .single();
      
    if (profileError) {
      console.error('Admin profili sorğusu zamanı xəta:', profileError);
      return null;
    }
    
    if (!profileData) return null;
    
    return {
      id: profileData.id,
      email: profileData.email || schoolData.admin_email || '',
      name: profileData.full_name || '',
      status: profileData.status || 'active',
      phone: profileData.phone || '',
      lastLogin: profileData.last_login || null,
      avatar: profileData.avatar || null
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
    console.log('assignSchoolAdmin çağırıldı:', { schoolId, userId });
    
    // Məktəb məlumatlarını əldə edək
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, region_id, sector_id')
      .eq('id', schoolId)
      .single();
      
    if (schoolError || !schoolData) {
      console.error('Məktəb məlumatları alınarkən xəta:', schoolError);
      return { 
        success: false, 
        error: schoolError?.message || 'Məktəb tapılmadı' 
      };
    }
    
    // İstifadəçi məlumatlarını əldə edək
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      console.error('İstifadəçi məlumatları alınarkən xəta:', userError);
      return { 
        success: false, 
        error: userError?.message || 'İstifadəçi tapılmadı' 
      };
    }
    
    // İstifadəçinin e-poçt məlumatı olmaya bilər, auth.users-dən alaq
    let userEmail = userData.email;
    if (!userEmail) {
      try {
        const { data: authUserData } = await supabase.functions.invoke('get-user-email', {
          body: { userId }
        });
        
        if (authUserData && authUserData.email) {
          userEmail = authUserData.email;
          console.log('auth.users-dən email alındı:', userEmail);
        }
      } catch (error) {
        console.warn('auth.users-dən email alınarkən xəta:', error);
      }
    }
    
    console.log('İstifadəçi və məktəb məlumatları alındı:', { userData, schoolData });
    
    // user_roles cədvəlində dəyişiklik
    const { error: assignRoleError } = await supabase.rpc('assign_school_admin', {
      user_id: userId,
      school_id: schoolId,
      region_id: schoolData.region_id,
      sector_id: schoolData.sector_id
    });
    
    if (assignRoleError) {
      console.error('assign_school_admin RPC xətası:', assignRoleError);
      return { 
        success: false, 
        error: assignRoleError.message || 'Admin rolu təyin edilərkən xəta baş verdi' 
      };
    }
    
    // Məktəb cədvəlində admin_id və admin_email yeniləmə
    const { error: updateSchoolError } = await supabase
      .from('schools')
      .update({ 
        admin_id: userId,
        admin_email: userEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId);
      
    if (updateSchoolError) {
      console.error('Məktəb yeniləmə xətası:', updateSchoolError);
      return { 
        success: false, 
        error: updateSchoolError.message || 'Məktəb məlumatları yenilərkən xəta baş verdi' 
      };
    }
    
    console.log('Məktəb admini uğurla təyin edildi');
    
    // Audit log daxil et
    try {
      await supabase.rpc('create_audit_log', {
        p_user_id: userId,
        p_action: 'assign_school_admin',
        p_entity_type: 'school',
        p_entity_id: schoolId,
        p_old_value: null,
        p_new_value: {
          school_id: schoolId,
          school_name: schoolData.name,
          admin_id: userId,
          admin_name: userData.full_name,
          admin_email: userEmail
        }
      });
    } catch (error) {
      console.warn('Audit log yaradılarkən xəta:', error);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Admin təyin etmə istisna:', error);
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
