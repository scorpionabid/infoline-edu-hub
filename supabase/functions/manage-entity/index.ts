
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

interface ManageEntityParams {
  action: "create" | "read" | "update" | "delete";
  entityType: "column" | "region" | "sector" | "school" | "category";
  data: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authorized', details: authError }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parametreleri al
    const { action, entityType, data } = await req.json() as ManageEntityParams

    // Kullanıcının yetki kontrolü 
    const { data: userRole, error: userRoleError } = await supabaseClient.rpc('get_user_role', {
      user_id: user.id
    })

    if (userRoleError) {
      return new Response(JSON.stringify({ error: 'Error checking user role', details: userRoleError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Yetki kontrolü ve varliği yönet
    let result;
    switch (action) {
      case "create":
        result = await handleCreate(supabaseClient, entityType, data, userRole);
        break;
      case "read":
        result = await handleRead(supabaseClient, entityType, data, userRole);
        break;
      case "update":
        result = await handleUpdate(supabaseClient, entityType, data, userRole);
        break;
      case "delete":
        result = await handleDelete(supabaseClient, entityType, data, userRole);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error, details: result.details }), {
        status: result.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Audit log oluştur
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: `${action}_${entityType}`,
        entity_type: entityType,
        entity_id: data.id || null,
        old_value: action === "update" || action === "delete" ? result.oldData : null,
        new_value: action === "create" || action === "update" ? result.data : null
      });

    return new Response(JSON.stringify({ success: true, data: result.data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error managing entity:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Yardımcı fonksiyonlar
async function handleCreate(supabase, entityType, data, userRole) {
  // Yetki kontrolü
  if (!canManageEntity(entityType, userRole)) {
    return { 
      error: 'Not authorized to create this entity',
      status: 403
    };
  }

  const tableName = getTableName(entityType);
  
  // Veri hazırlama (ör. timestamp ekleme)
  const now = new Date().toISOString();
  const insertData = {
    ...data,
    created_at: now,
    updated_at: now
  };

  const { data: result, error } = await supabase
    .from(tableName)
    .insert(insertData)
    .select();

  if (error) {
    return {
      error: `Error creating ${entityType}`,
      details: error,
      status: 500
    };
  }

  return { data: result[0] };
}

async function handleRead(supabase, entityType, data, userRole) {
  const tableName = getTableName(entityType);
  let query = supabase.from(tableName).select('*');

  // ID belirtilmişse sadece o kaydı getir
  if (data.id) {
    query = query.eq('id', data.id);
  }

  // Rol bazlı filtreler
  if (userRole === 'regionadmin' && data.region_id) {
    query = query.eq('region_id', data.region_id);
  } else if (userRole === 'sectoradmin' && data.sector_id) {
    query = query.eq('sector_id', data.sector_id);
  } else if (userRole === 'schooladmin' && data.school_id) {
    query = query.eq('school_id', data.school_id);
  }

  // Diğer filtreler
  if (data.filters) {
    Object.entries(data.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }

  // Sıralama
  if (data.orderBy) {
    query = query.order(data.orderBy.column, { 
      ascending: data.orderBy.ascending !== false 
    });
  }

  // Pagination
  if (data.limit) {
    query = query.limit(data.limit);
  }
  if (data.offset) {
    query = query.offset(data.offset);
  }

  const { data: result, error } = await query;

  if (error) {
    return {
      error: `Error reading ${entityType}`,
      details: error,
      status: 500
    };
  }

  return { data: result };
}

async function handleUpdate(supabase, entityType, data, userRole) {
  // Yetki kontrolü
  if (!canManageEntity(entityType, userRole)) {
    return { 
      error: 'Not authorized to update this entity',
      status: 403
    };
  }

  if (!data.id) {
    return {
      error: 'ID is required for update',
      status: 400
    };
  }

  const tableName = getTableName(entityType);
  
  // Mevcut veriyi al (audit log için)
  const { data: oldData, error: readError } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', data.id)
    .single();

  if (readError) {
    return {
      error: `Error reading existing ${entityType}`,
      details: readError,
      status: 500
    };
  }

  // Veriyi güncelle
  const updateData = {
    ...data,
    updated_at: new Date().toISOString()
  };
  delete updateData.id; // ID'yi güncelleme verilerinden çıkar

  const { data: result, error: updateError } = await supabase
    .from(tableName)
    .update(updateData)
    .eq('id', data.id)
    .select();

  if (updateError) {
    return {
      error: `Error updating ${entityType}`,
      details: updateError,
      status: 500
    };
  }

  return { 
    data: result[0],
    oldData: oldData
  };
}

async function handleDelete(supabase, entityType, data, userRole) {
  // Yetki kontrolü
  if (!canManageEntity(entityType, userRole)) {
    return { 
      error: 'Not authorized to delete this entity',
      status: 403
    };
  }

  if (!data.id) {
    return {
      error: 'ID is required for delete',
      status: 400
    };
  }

  const tableName = getTableName(entityType);
  
  // Mevcut veriyi al (audit log için)
  const { data: oldData, error: readError } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', data.id)
    .single();

  if (readError) {
    return {
      error: `Error reading existing ${entityType}`,
      details: readError,
      status: 500
    };
  }

  // İlişkili kayıtları kontrol et
  const relationCheckResult = await checkRelatedRecords(supabase, entityType, data.id);
  if (relationCheckResult.hasRelatedRecords) {
    return {
      error: `Cannot delete ${entityType} because it has related records`,
      details: relationCheckResult.details,
      status: 409 // Conflict
    };
  }

  // Veriyi sil
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .eq('id', data.id);

  if (deleteError) {
    return {
      error: `Error deleting ${entityType}`,
      details: deleteError,
      status: 500
    };
  }

  return { 
    data: { id: data.id, deleted: true },
    oldData: oldData
  };
}

// Yardımcı fonksiyonlar
function getTableName(entityType) {
  switch (entityType) {
    case "column": return "columns";
    case "region": return "regions";
    case "sector": return "sectors";
    case "school": return "schools";
    case "category": return "categories";
    default: return entityType + "s"; // varsayılan çoğul form
  }
}

function canManageEntity(entityType, userRole) {
  // Süper admin her şeyi yapabilir
  if (userRole === 'superadmin') return true;

  // Diğer roller için izinlere bak
  switch (entityType) {
    case "region":
      return userRole === 'superadmin';
    case "sector":
      return userRole === 'superadmin' || userRole === 'regionadmin';
    case "school":
      return userRole === 'superadmin' || userRole === 'regionadmin' || userRole === 'sectoradmin';
    case "column":
    case "category":
      return userRole === 'superadmin' || userRole === 'regionadmin';
    default:
      return false;
  }
}

async function checkRelatedRecords(supabase, entityType, entityId) {
  switch (entityType) {
    case "region":
      // Bölgeye bağlı sektörler var mı kontrol et
      const { data: sectors, error: sectorError } = await supabase
        .from('sectors')
        .select('id')
        .eq('region_id', entityId)
        .limit(1);
      
      if (sectorError) {
        return { error: 'Error checking related sectors', details: sectorError };
      }
      
      if (sectors && sectors.length > 0) {
        return { 
          hasRelatedRecords: true,
          details: { relatedTable: 'sectors', count: sectors.length }
        };
      }
      break;
    
    case "sector":
      // Sektöre bağlı okullar var mı kontrol et
      const { data: schools, error: schoolError } = await supabase
        .from('schools')
        .select('id')
        .eq('sector_id', entityId)
        .limit(1);
      
      if (schoolError) {
        return { error: 'Error checking related schools', details: schoolError };
      }
      
      if (schools && schools.length > 0) {
        return { 
          hasRelatedRecords: true,
          details: { relatedTable: 'schools', count: schools.length }
        };
      }
      break;
    
    case "category":
      // Kategoriye bağlı sütunlar var mı kontrol et
      const { data: columns, error: columnError } = await supabase
        .from('columns')
        .select('id')
        .eq('category_id', entityId)
        .limit(1);
      
      if (columnError) {
        return { error: 'Error checking related columns', details: columnError };
      }
      
      if (columns && columns.length > 0) {
        return { 
          hasRelatedRecords: true,
          details: { relatedTable: 'columns', count: columns.length }
        };
      }
      break;
  }
  
  return { hasRelatedRecords: false };
}
