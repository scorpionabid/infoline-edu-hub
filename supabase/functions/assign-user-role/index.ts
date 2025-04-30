
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';
import { AssignUserRoleParams } from '../_shared/types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  // CORS işleme
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Token doğrulama
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Yetkiləndirmə token tapılmadı' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Auth client
    const authClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // İstifadəçi yoxlama
    const {
      data: { user: authUser },
      error: userError
    } = await authClient.auth.getUser();

    if (userError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi doğrulanmadı' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Səlahiyyətli client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Yetki yoxlanışı
    const { data: currentUserRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .single();

    if (!currentUserRoles || (currentUserRoles.role !== 'superadmin' && currentUserRoles.role !== 'regionadmin')) {
      return new Response(
        JSON.stringify({ error: 'Bu əməliyyat üçün icazəniz yoxdur' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // İstək parametrlərini al
    const params: AssignUserRoleParams = await req.json();
    const { userId, role, entityId } = params;

    if (!userId || !role) {
      return new Response(
        JSON.stringify({ error: 'Tələb olunan parametrlər çatışmır' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // İstifadəçinin mövcud rolunu yoxla
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleError) {
      return new Response(
        JSON.stringify({ error: 'Rol məlumatları alınarkən xəta baş verdi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const roleData: any = {
      user_id: userId,
      role: role
    };

    // Rolun tələb etdiyi entityId əlavə et
    switch (role) {
      case 'regionadmin':
        if (!entityId) {
          return new Response(
            JSON.stringify({ error: 'Region admini üçün region_id tələb olunur' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        roleData.region_id = entityId;
        break;
      case 'sectoradmin':
        if (!entityId) {
          return new Response(
            JSON.stringify({ error: 'Sektor admini üçün sector_id tələb olunur' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        roleData.sector_id = entityId;
        // Sektor ID-ə uyğun Region ID-ni tap
        const { data: sectorInfo } = await supabase
          .from('sectors')
          .select('region_id')
          .eq('id', entityId)
          .single();
        if (sectorInfo) {
          roleData.region_id = sectorInfo.region_id;
        }
        break;
      case 'schooladmin':
        if (!entityId) {
          return new Response(
            JSON.stringify({ error: 'Məktəb admini üçün school_id tələb olunur' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        roleData.school_id = entityId;
        // Məktəb ID-ə uyğun Region və Sector ID-ni tap
        const { data: schoolInfo } = await supabase
          .from('schools')
          .select('region_id, sector_id')
          .eq('id', entityId)
          .single();
        if (schoolInfo) {
          roleData.region_id = schoolInfo.region_id;
          roleData.sector_id = schoolInfo.sector_id;
        }
        break;
    }

    // Əgər mövcud rol varsa, yenilə, yoxdursa əlavə et
    let result;
    if (existingRole) {
      const { error: updateError } = await supabase
        .from('user_roles')
        .update(roleData)
        .eq('user_id', userId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Rol yenilərkən xəta baş verdi', details: updateError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = { success: true, message: 'İstifadəçi rolu yeniləndi' };
    } else {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert(roleData);

      if (insertError) {
        return new Response(
          JSON.stringify({ error: 'Rol əlavə edilərkən xəta baş verdi', details: insertError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = { success: true, message: 'İstifadəçiyə rol təyin edildi' };
    }

    // İstifadəçi məlumatlarını yenilə - profile cədvəlində
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userProfile) {
      await supabase
        .from('profiles')
        .update({
          role: role,
          region_id: roleData.region_id || null,
          sector_id: roleData.sector_id || null, 
          school_id: roleData.school_id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }

    // Audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authUser.id,
        action: 'assign_role',
        entity_type: 'user_roles',
        entity_id: userId,
        details: {
          role: role,
          entity_id: entityId,
          assigned_by: authUser.id
        }
      });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'İstək işlənərkən xəta baş verdi', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
