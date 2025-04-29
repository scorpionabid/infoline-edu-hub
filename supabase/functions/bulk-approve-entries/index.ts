
import { handleCors } from '../_shared/middleware.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve((req) => handleCors(req, async (req) => {
  try {
    // Supabase klienti yaradırıq
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // İstifadəçi məlumatlarını alırıq
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi təsdiqlənmədi' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    // İstifadəçinin rolunu yoxlayırıq
    const { data: userRole, error: roleError } = await supabaseClient.rpc('get_user_role_safe');
    
    if (roleError) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi rolu alınarkən xəta: ' + roleError.message }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Yalnız sektor admini və ya region admini və ya superadmin bu funksiyanı çağıra bilər
    if (userRole !== 'sectoradmin' && userRole !== 'regionadmin' && userRole !== 'superadmin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Bu əməliyyat üçün icazəniz yoxdur' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }
    
    // Sorğu parametrlərini alırıq
    const { schoolId, categoryId, action, reason, entryIds } = await req.json();
    
    if (!schoolId || !categoryId || !action || !entryIds) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məktəb ID, Kateqoriya ID, əməliyyat və ya məlumat ID-ləri təqdim edilməyib' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Əməliyyatın düzgün olub-olmadığını yoxlayırıq
    if (action !== 'approve' && action !== 'reject') {
      return new Response(
        JSON.stringify({ success: false, error: 'Yanlış əməliyyat: ' + action + '. Yalnız "approve" və ya "reject" ola bilər' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Əgər əməliyyat "reject" olarsa, səbəb tələb olunur
    if (action === 'reject' && !reason) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rədd etmək üçün səbəb göstərilməlidir' }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Məktəb və kateqoriya məlumatlarını alırıq
    const { data: school, error: schoolError } = await supabaseClient
      .from('schools')
      .select('id, name, sector_id, region_id')
      .eq('id', schoolId)
      .single();
      
    if (schoolError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məktəb məlumatları alınarkən xəta: ' + schoolError.message }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Sektor admini üçün icazəni yoxlayırıq
    if (userRole === 'sectoradmin') {
      // İstifadəçinin sektor ID-sini alırıq
      const { data: userSectorId, error: sectorError } = await supabaseClient.rpc('get_user_sector_id');
      
      if (sectorError) {
        return new Response(
          JSON.stringify({ success: false, error: 'İstifadəçi sektor ID alınarkən xəta: ' + sectorError.message }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // İstifadəçinin məktəbin aid olduğu sektora icazəsi olub-olmadığını yoxlayırıq
      if (userSectorId !== school.sector_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Bu məktəb üzərində əməliyyat aparmaq üçün icazəniz yoxdur' }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 403 
          }
        );
      }
    }
    
    // Region admini üçün icazəni yoxlayırıq
    if (userRole === 'regionadmin') {
      // İstifadəçinin region ID-sini alırıq
      const { data: userRegionId, error: regionError } = await supabaseClient.rpc('get_user_region_id');
      
      if (regionError) {
        return new Response(
          JSON.stringify({ success: false, error: 'İstifadəçi region ID alınarkən xəta: ' + regionError.message }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // İstifadəçinin məktəbin aid olduğu regiona icazəsi olub-olmadığını yoxlayırıq
      if (userRegionId !== school.region_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Bu məktəb üzərində əməliyyat aparmaq üçün icazəniz yoxdur' }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 403 
          }
        );
      }
    }
    
    // Kateqoriya məlumatlarını alırıq
    const { data: category, error: categoryError } = await supabaseClient
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();
      
    if (categoryError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Kateqoriya məlumatları alınarkən xəta: ' + categoryError.message }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Məktəb adminini tapırıq
    const { data: schoolAdmins, error: schoolAdminError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('school_id', schoolId)
      .eq('role', 'schooladmin');
      
    if (schoolAdminError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məktəb admini tapılarkən xəta: ' + schoolAdminError.message }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Məlumatların statusunu yeniləyirik
    if (action === 'approve') {
      // Məlumatları təsdiqləyirik
      const { error: updateError } = await supabaseClient
        .from('data_entries')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', entryIds);
        
      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Məlumatların statusu yenilənərkən xəta: ' + updateError.message }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // Məktəb admininə bildiriş göndəririk
      if (schoolAdmins && schoolAdmins.length > 0) {
        const notificationPromises = schoolAdmins.map(admin => {
          return supabaseClient
            .from('notifications')
            .insert({
              user_id: admin.user_id,
              type: 'success',
              title: 'Məlumatlar təsdiqləndi',
              message: `"${category.name}" kateqoriyası üçün daxil etdiyiniz məlumatlar təsdiqləndi.`,
              related_entity_id: categoryId,
              related_entity_type: 'category',
              is_read: false,
              priority: 'normal',
              created_at: new Date().toISOString()
            });
        });
        
        await Promise.all(notificationPromises);
      }
      
      // Audit log yaradırıq
      await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'approve_entries',
          entity_type: 'category',
          entity_id: categoryId,
          old_value: JSON.stringify({ status: 'pending' }),
          new_value: JSON.stringify({ 
            status: 'approved',
            school_id: schoolId,
            category_id: categoryId
          }),
          created_at: new Date().toISOString()
        });
        
    } else if (action === 'reject') {
      // Məlumatları rədd edirik
      const { error: updateError } = await supabaseClient
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .in('id', entryIds);
        
      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Məlumatların statusu yenilənərkən xəta: ' + updateError.message }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // Məktəb admininə bildiriş göndəririk
      if (schoolAdmins && schoolAdmins.length > 0) {
        const notificationPromises = schoolAdmins.map(admin => {
          return supabaseClient
            .from('notifications')
            .insert({
              user_id: admin.user_id,
              type: 'error',
              title: 'Məlumatlar rədd edildi',
              message: `"${category.name}" kateqoriyası üçün daxil etdiyiniz məlumatlar rədd edildi. Səbəb: ${reason}`,
              related_entity_id: categoryId,
              related_entity_type: 'category',
              is_read: false,
              priority: 'high',
              created_at: new Date().toISOString()
            });
        });
        
        await Promise.all(notificationPromises);
      }
      
      // Audit log yaradırıq
      await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'reject_entries',
          entity_type: 'category',
          entity_id: categoryId,
          old_value: JSON.stringify({ status: 'pending' }),
          new_value: JSON.stringify({ 
            status: 'rejected',
            school_id: schoolId,
            category_id: categoryId,
            reason: reason
          }),
          created_at: new Date().toISOString()
        });
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: action === 'approve' ? 'Məlumatlar uğurla təsdiqləndi' : 'Məlumatlar uğurla rədd edildi' 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Serverdə xəta:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}));
