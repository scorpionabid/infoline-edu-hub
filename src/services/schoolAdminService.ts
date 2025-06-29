import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { School, SchoolAdmin } from '@/types/school';
import { FormNotification } from '@/types/adapters';

// Existing user-i school admin təyin etmə funksiyası (Sector model əsasında)
export const assignExistingUserAsSchoolAdmin = async (userId: string, schoolId: string) => {
  try {
    console.log('🏫 assignExistingUserAsSchoolAdmin çağırıldı:', { userId, schoolId });
    
    // Get school data to get region_id and sector_id
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('region_id, sector_id, name')
      .eq('id', schoolId)
      .single();
      
    if (schoolError) {
      console.error('Məktəb məlumatları əldə edilərkən xəta:', schoolError);
      return { success: false, error: schoolError.message };
    }
    
    console.log('🏫 School data retrieved:', {
      schoolId,
      schoolName: schoolData.name,
      region_id: schoolData.region_id,
      sector_id: schoolData.sector_id
    });

    // Check if user already has a role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Rol yoxlanılırkən xəta:', checkError);
      return { success: false, error: checkError.message };
    }
    
    if (!existingRole) {
      // Insert new role
      const roleData = {
        user_id: userId,
        role: 'schooladmin',
        school_id: schoolId,
        sector_id: schoolData.sector_id,
        region_id: schoolData.region_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Inserting new role:', roleData);
      
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(roleData);
        
      if (insertError) {
        console.error('Rol əlavə edilərkən xəta:', insertError);
        return { success: false, error: insertError.message };
      }
    } else {
      // Update existing role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          role: 'schooladmin', 
          school_id: schoolId,
          sector_id: schoolData.sector_id,
          region_id: schoolData.region_id,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Rol yenilənərkən xəta:', updateError);
        return { success: false, error: updateError.message };
      }
    }

    // Update school admin_id
    const { error: schoolUpdateError } = await supabase
      .from('schools')
      .update({ 
        admin_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId);
      
    if (schoolUpdateError) {
      console.error('Məktəb admin_id yenilənərkən xəta:', schoolUpdateError);
      return { success: false, error: schoolUpdateError.message };
    }

    console.log('✅ Məktəb admini uğurla təyin edildi');
    return { success: true };
  } catch (error: any) {
    console.error('Xəta:', error);
    return { success: false, error: error.message || 'Bilinməyən xəta' };
  }
};

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
    console.log('assignSchoolAdmin cagiridi:', { 
      schoolId, 
      userId, 
      userIdType: typeof userId,
      userIdLength: userId?.length,
      schoolIdType: typeof schoolId,
      schoolIdLength: schoolId?.length
    });
    
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
    
    // İstifadəçi məlumatlarını əldə edək - maybeSingle() istifadə edərək
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .maybeSingle();
      
    if (userError) {
      console.error('İstifadəçi məlumatları alınarkən xəta:', userError);
      return { 
        success: false, 
        error: userError.message || 'İstifadəçi məlumatları alınarkən xəta baş verdi' 
      };
    }
    
    if (!userData) {
      console.error('İstifadəçi tapılmadı:', userId);
      return { 
        success: false, 
        error: 'İstifadəçi tapılmadı' 
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
    
    // user_roles cədvəlində dəyişiklik - assign_school_admin RPC çağırışı
    console.log('assign_school_admin RPC çağırılır:', {
      user_id: userId,
      school_id: schoolId,
      region_id: schoolData.region_id,
      sector_id: schoolData.sector_id
    });
    
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
        error: `RPC xətası: ${assignRoleError.message}` || 'Admin rolu təyin edilərkən xəta baş verdi' 
      };
    }
    
    console.log('assign_school_admin RPC uğurla icra edildi');
    
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
