
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';
import { ManageEntityParams } from '../_shared/types.ts';

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

    // İstək parametrlərini al
    const params: ManageEntityParams = await req.json();
    const { action, entityType, data } = params;

    if (!action || !entityType) {
      return new Response(
        JSON.stringify({ error: 'Tələb olunan parametrlər çatışmır' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // İstifadəçi rolunu yoxla və səlahiyyətləri təyin et
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, region_id, sector_id, school_id')
      .eq('user_id', authUser.id)
      .single();

    if (!userRole) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi rolu tapılmadı' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cədvəl adını təyin et
    const tableMap = {
      column: 'columns',
      region: 'regions',
      sector: 'sectors',
      school: 'schools',
      category: 'categories'
    };

    const tableName = tableMap[entityType];
    if (!tableName) {
      return new Response(
        JSON.stringify({ error: 'Yalnış entity növü' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Səlahiyyət yoxlanışı
    if (!await hasPermission(supabase, authUser.id, userRole, action, entityType, data)) {
      return new Response(
        JSON.stringify({ error: 'Bu əməliyyat üçün icazəniz yoxdur' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    const now = new Date().toISOString();

    // CRUD əməliyyatı
    switch (action) {
      case 'create':
        const createData = { 
          ...data,
          created_at: data.created_at || now
        };
        const { data: createdData, error: createError } = await supabase
          .from(tableName)
          .insert(createData)
          .select()
          .single();

        if (createError) {
          return new Response(
            JSON.stringify({ error: `${entityType} yaradılarkən xəta baş verdi`, details: createError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = { success: true, data: createdData, message: `${entityType} uğurla yaradıldı` };
        break;

      case 'read':
        const selectQuery = supabase.from(tableName).select(data.select || '*');
        
        // Filtrəri əlavə et
        if (data.filters) {
          for (const [key, value] of Object.entries(data.filters)) {
            if (value !== undefined) {
              selectQuery.eq(key, value);
            }
          }
        }

        // Sıralama
        if (data.orderBy) {
          selectQuery.order(data.orderBy, { ascending: data.ascending !== false });
        }

        // Səhifələmə
        if (data.limit) {
          selectQuery.limit(data.limit);
        }
        if (data.offset) {
          selectQuery.range(data.offset, data.offset + (data.limit || 10) - 1);
        }

        const { data: readData, error: readError } = await selectQuery;

        if (readError) {
          return new Response(
            JSON.stringify({ error: `${entityType} oxunarkən xəta baş verdi`, details: readError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = { success: true, data: readData };
        break;

      case 'update':
        if (!data.id) {
          return new Response(
            JSON.stringify({ error: 'Yeniləmə üçün ID tələb olunur' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const updateData = { 
          ...data,
          updated_at: data.updated_at || now,
          id: undefined // ID-ni silək, çünki onu where şərtində istifadə edəcəyik
        };
        delete updateData.id;

        const { data: updatedData, error: updateError } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', data.id)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: `${entityType} yenilərkən xəta baş verdi`, details: updateError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = { success: true, data: updatedData, message: `${entityType} uğurla yeniləndi` };
        break;

      case 'delete':
        if (!data.id) {
          return new Response(
            JSON.stringify({ error: 'Silmə üçün ID tələb olunur' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', data.id);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: `${entityType} silərkən xəta baş verdi`, details: deleteError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = { success: true, message: `${entityType} uğurla silindi` };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Dəstəklənməyən əməliyyat' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authUser.id,
        action: action,
        entity_type: entityType,
        entity_id: data.id || (result.data && result.data.id) || null,
        details: {
          data: data,
          result: action === 'read' ? { count: result.data.length } : result
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

// Səlahiyyət yoxlama funksiyası
async function hasPermission(supabase, userId, userRole, action, entityType, data) {
  const role = userRole.role;

  // SuperAdmin hər şeyə icazə var
  if (role === 'superadmin') {
    return true;
  }

  // Region admini üçün
  if (role === 'regionadmin') {
    switch (entityType) {
      case 'region':
        // Region admini yalnız öz regionunu idarə edə bilər
        return action === 'read' || 
               (data && data.id === userRole.region_id);
      case 'sector':
        // Region admini öz regionunda olan sektorlarda əməliyyat apara bilər
        if (action === 'read') return true;
        if (!data.region_id) return false;
        return data.region_id === userRole.region_id;
      case 'school':
        // Region admini öz regionunda olan məktəblərdə əməliyyat apara bilər
        if (action === 'read') return true;
        if (!data.region_id) return false;
        return data.region_id === userRole.region_id;
      case 'category':
      case 'column':
        // Region admini kateqoriya və sütunları idarə edə bilər
        return true;
      default:
        return false;
    }
  }

  // Sektor admini üçün
  if (role === 'sectoradmin') {
    switch (entityType) {
      case 'school':
        // Sektor admini öz sektorunda olan məktəblərdə əməliyyat apara bilər
        if (action === 'read') return true;
        if (!data.sector_id) return false;
        return data.sector_id === userRole.sector_id;
      case 'category':
      case 'column':
        // Sektor admini kateqoriya və sütunları yalnız oxuya bilər
        return action === 'read';
      default:
        return false;
    }
  }

  // Məktəb admini üçün
  if (role === 'schooladmin') {
    switch (entityType) {
      case 'category':
      case 'column':
        // Məktəb admini kateqoriya və sütunları yalnız oxuya bilər
        return action === 'read';
      default:
        return false;
    }
  }

  return false;
}
