
import { handleCors } from '../_shared/middleware.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve((req) => handleCors(req, async (req) => {
  try {
    // Supabase klienti yaradırıq
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Gələn məlumatları alaq
    const { column, userId } = await req.json();

    if (!column || !column.category_id || !column.name || !column.type) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // İstifadəçinin rolunu yoxlayaq
    const { data: userRoleData, error: userRoleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (userRoleError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify user role' }),
        { headers: { 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Yalnız superadmin və regionadmin sütun yarada bilər
    if (!['superadmin', 'regionadmin'].includes(userRoleData.role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient permissions' }),
        { headers: { 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Sütun yaratma
    const { data: createdColumn, error: columnError } = await supabaseClient
      .from('columns')
      .insert([column])
      .select()
      .single();

    if (columnError) {
      return new Response(
        JSON.stringify({ success: false, error: columnError.message }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Kateqoriyanın sütun sayını artır
    try {
      // Kateqoriyanın mövcud sütun sayını əldə edək
      const { data: category, error: categoryError } = await supabaseClient
        .from('categories')
        .select('column_count')
        .eq('id', column.category_id)
        .single();

      if (!categoryError) {
        const currentCount = category.column_count || 0;
        await supabaseClient
          .from('categories')
          .update({ column_count: currentCount + 1 })
          .eq('id', column.category_id);
      }
    } catch (countError) {
      console.error('Sütun sayı yeniləmə xətası:', countError);
      // Bu xəta əsas əməliyyatı dayandırmamalıdır
    }

    return new Response(
      JSON.stringify({ success: true, data: createdColumn }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Server error:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}));
