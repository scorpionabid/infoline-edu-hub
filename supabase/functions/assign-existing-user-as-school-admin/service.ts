
// Məktəb admin təyini üçün xidmət funksiyaları
import { createRpcFunction, getUserById } from './rpc.ts';

export async function assignUserAsSchoolAdmin(supabase: any, userId: string, schoolId: string) {
  try {
    console.log(`Məktəb adminini təyin etmə başlayır: User ID=${userId}, School ID=${schoolId}`);
    
    // İstifadəçinin auth cədvəlində mövcudluğunu yoxlayaq
    const { data: userData, error: userError } = await getUserById(supabase, userId);
    if (userError || !userData) {
      console.error('İstifadəçi məlumatları əldə edilərkən xəta:', userError);
      return { 
        success: false, 
        error: userError?.message || 'İstifadəçi tapılmadı' 
      };
    }
    
    console.log('İstifadəçi məlumatları əldə edildi:', userData);
    
    // Məktəbin mövcudluğunu yoxlayaq
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .maybeSingle();
    
    if (schoolError) {
      console.error('Məktəb məlumatları əldə edilərkən xəta:', schoolError);
      return { 
        success: false, 
        error: schoolError.message || 'Məktəb məlumatları əldə edilərkən xəta' 
      };
    }
    
    if (!school) {
      console.error('Məktəb tapılmadı:', schoolId);
      return { 
        success: false, 
        error: 'Verilmiş ID ilə məktəb tapılmadı' 
      };
    }
    
    console.log('Məktəb məlumatları əldə edildi:', school);
    
    // İstifadəçinin rolunu əldə edək
    const getRoleFunction = createRpcFunction(supabase, 'get_user_role_by_id');
    const { data: userRole, error: roleError } = await getRoleFunction({ user_id: userId });
    
    if (roleError) {
      console.error('İstifadəçi rolu yoxlanarkən xəta:', roleError);
      return { 
        success: false, 
        error: roleError.message || 'İstifadəçi rolu yoxlanarkən xəta' 
      };
    }
    
    console.log('İstifadəçi rolu əldə edildi:', userRole);
    
    // Əgər məktəbin artıq adminı varsa
    if (school.admin_id) {
      console.error('Bu məktəbin artıq adminı var:', school.admin_id);
      return { 
        success: false, 
        error: 'Bu məktəbin artıq adminı var' 
      };
    }
    
    // İstifadəçinin mövcud rollarını silək
    const { error: deleteRoleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (deleteRoleError) {
      console.error('Köhnə istifadəçi rolu silinərkən xəta:', deleteRoleError);
      return { 
        success: false, 
        error: deleteRoleError.message || 'Köhnə istifadəçi rolu silinərkən xəta' 
      };
    }
    
    console.log('Köhnə istifadəçi rolları silindi');
    
    // Yeni məktəb admin rolunu əlavə edək
    const { error: insertRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'schooladmin',
        school_id: schoolId,
        sector_id: school.sector_id,
        region_id: school.region_id
      });
    
    if (insertRoleError) {
      console.error('Yeni istifadəçi rolu əlavə edilərkən xəta:', insertRoleError);
      return { 
        success: false, 
        error: insertRoleError.message || 'Yeni istifadəçi rolu əlavə edilərkən xəta' 
      };
    }
    
    console.log('Məktəb admin rolu əlavə edildi');
    
    // Məktəb cədvəlində admin məlumatlarını yeniləyək
    const { error: updateSchoolError } = await supabase
      .from('schools')
      .update({
        admin_id: userId,
        admin_email: userData.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId);
    
    if (updateSchoolError) {
      console.error('Məktəb admin məlumatları yenilənərkən xəta:', updateSchoolError);
      return { 
        success: false, 
        error: updateSchoolError.message || 'Məktəb admin məlumatları yenilənərkən xəta' 
      };
    }
    
    console.log('Məktəb admin məlumatları yeniləndi');
    
    // Audit jurnal əlavə edək
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'assign_school_admin',
          entity_type: 'school',
          entity_id: schoolId,
          new_value: {
            school_id: schoolId,
            school_name: school.name,
            admin_id: userId,
            admin_email: userData.email
          }
        });
      
      console.log('Audit jurnal əlavə edildi');
    } catch (auditError) {
      // Audit jurnal əlavə edilməsində xəta olsa da, əsas əməliyyatı dayandırmırıq
      console.error('Audit jurnal əlavə edilərkən xəta:', auditError);
    }
    
    // Uğurlu nəticə qaytaraq
    return {
      success: true,
      data: {
        message: 'İstifadəçi məktəb admini olaraq uğurla təyin edildi',
        user: {
          id: userId,
          email: userData.email
        },
        school: {
          id: schoolId,
          name: school.name
        }
      }
    };
  } catch (error) {
    console.error('Məktəb adminini təyin edərkən ümumi xəta:', error);
    return {
      success: false,
      error: error.message || 'Məktəb adminini təyin edərkən gözlənilməz xəta'
    };
  }
}
