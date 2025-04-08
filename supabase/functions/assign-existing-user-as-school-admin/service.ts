
import { createRpcFunction, getUserById } from './rpc';

// Mövcud istifadəçini məktəb admini kimi təyin etmək üçün əsas funksiya
export async function assignUserAsSchoolAdmin(supabase: any, userId: string, schoolId: string) {
  try {
    console.log(`assignUserAsSchoolAdmin başladı - userId: ${userId}, schoolId: ${schoolId}`);
    
    // 1. Məktəbin mövcud olduğunu yoxlayaq
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, region_id, sector_id')
      .eq('id', schoolId)
      .single();
    
    if (schoolError) {
      console.error('Məktəb yoxlama xətası:', schoolError);
      return { 
        success: false, 
        error: `Məktəb tapılmadı: ${schoolError.message}` 
      };
    }
    
    if (!school) {
      return { 
        success: false, 
        error: 'Məktəb tapılmadı' 
      };
    }
    
    console.log('Məktəb tapıldı:', JSON.stringify(school));
    
    // 2. İstifadəçi məlumatlarını alaq
    const { data: user, error: userError } = await getUserById(supabase, userId);
    
    if (userError || !user) {
      console.error('İstifadəçi məlumatları xətası:', userError);
      return { 
        success: false, 
        error: `İstifadəçi tapılmadı: ${userError?.message || 'Bilinməyən xəta'}` 
      };
    }
    
    console.log('İstifadəçi tapıldı:', JSON.stringify(user));
    
    // 3. İstifadəçinin mövcud rollarını silək
    const deleteRolesRpc = createRpcFunction(supabase, 'delete_user_roles');
    await deleteRolesRpc({ user_id: userId });
    
    console.log('Köhnə roller silindi');
    
    // 4. Yeni rol təyin edək
    const { data: newRole, error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'schooladmin',
        school_id: schoolId,
        region_id: school.region_id,
        sector_id: school.sector_id
      })
      .select()
      .single();
    
    if (roleError) {
      console.error('Rol təyin etmə xətası:', roleError);
      return { 
        success: false, 
        error: `Rol təyin edilərkən xəta: ${roleError.message}` 
      };
    }
    
    console.log('Yeni rol təyin edildi:', JSON.stringify(newRole));
    
    // 5. Məktəbin admin məlumatlarını yeniləyək
    const { data: updatedSchool, error: updateError } = await supabase
      .from('schools')
      .update({
        admin_id: userId,
        admin_email: user.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Məktəb yeniləmə xətası:', updateError);
      return { 
        success: false, 
        error: `Məktəb yenilərkən xəta: ${updateError.message}` 
      };
    }
    
    console.log('Məktəb yeniləndi:', JSON.stringify(updatedSchool));
    
    // 6. Audit log əlavə edək
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'assign_school_admin',
        entity_type: 'school',
        entity_id: schoolId,
        new_value: {
          school_id: schoolId,
          school_name: school.name,
          admin_id: userId,
          admin_email: user.email
        }
      });
      console.log('Audit log əlavə edildi');
    } catch (auditError) {
      // Audit log xətasının əsas əməliyyata təsir etməsinə imkan verməyin
      console.error('Audit log xətası (kritik deyil):', auditError);
    }
    
    // 7. Uğurlu nəticə qaytaraq
    return {
      success: true,
      data: {
        school: updatedSchool,
        admin: {
          id: userId,
          email: user.email
        }
      },
      message: 'İstifadəçi məktəb admini kimi uğurla təyin edildi'
    };
    
  } catch (error) {
    console.error('Ümumi xəta:', error);
    return {
      success: false,
      error: error.message || 'Məktəb admini təyin edilərkən xəta baş verdi'
    };
  }
}
