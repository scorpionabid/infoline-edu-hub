
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase_oauth
// See also https://deno.com/deploy/docs/runtime-fs
// And https://deno.com/deploy/docs/runtime-headers

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface SchoolCreateProps {
  name: string;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  regionId: string;
  sectorId: string;
  region_id: string; // API üçün region_id parametrini də qəbul edirik
  sector_id: string; // API üçün sector_id parametrini də qəbul edirik
  studentCount?: number;
  teacherCount?: number;
  type?: string;
  language?: string;
  status?: string;
  adminEmail?: string;
  adminFullName?: string;
  adminPassword?: string;
  adminStatus?: string;
}

interface SchoolOperationResponse {
  success: boolean;
  data?: any;
  error?: string;
}

console.log("School operations edge function loaded");

// Supabase müştərisi yaratmaq
const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Əməliyyat üçün cavab yaratmaq
const createResponse = (success: boolean, data?: any, error?: string): Response => {
  return new Response(
    JSON.stringify({
      success,
      data,
      error
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: success ? 200 : 400,
    },
  );
};

// Məktəb yaratma prosesi
async function createSchool(supabase: any, payload: SchoolCreateProps): Promise<SchoolOperationResponse> {
  console.log("Başladı: məktəb əlavə etmə prosesi", JSON.stringify(payload));

  try {
    // region_id və sector_id üçün regional ID-ləri istifadə edək
    // Həm regionId/sectorId, həm də region_id/sector_id parametrlərini dəstəkləyirik
    const regionId = payload.regionId || payload.region_id;
    const sectorId = payload.sectorId || payload.sector_id;
    
    // RegionId və SectorId-nin mövcudluğunu yoxlayaq
    if (!regionId) {
      return { success: false, error: "Region ID təyin edilməyib" };
    }
    if (!sectorId) {
      return { success: false, error: "Sektor ID təyin edilməyib" };
    }

    // Məlumatları hazırlayaq
    const schoolData = {
      name: payload.name,
      principal_name: payload.principalName || null,
      region_id: regionId,
      sector_id: sectorId,
      address: payload.address || null,
      email: payload.email || null,
      phone: payload.phone || null,
      student_count: payload.studentCount || null,
      teacher_count: payload.teacherCount || null,
      status: payload.status || 'active',
      type: payload.type || null,
      language: payload.language || null
    };

    console.log("Məktəb məlumatları:", JSON.stringify(schoolData));

    // Məktəbi əlavə edək
    const { data: newSchool, error: schoolError } = await supabase
      .from('schools')
      .insert(schoolData)
      .select()
      .single();

    if (schoolError) {
      console.error("Məktəb yaradılarkən xəta:", schoolError);
      return { success: false, error: `Məktəb yaradıla bilmədi: ${schoolError.message}` };
    }

    console.log("Məktəb uğurla yaradıldı:", JSON.stringify(newSchool));

    // Admin məlumatlarını yoxlayaq və admin yaradaq
    if (payload.adminEmail && payload.adminFullName && payload.adminPassword) {
      console.log("Admin yaratma prosesi başladı");
      
      // Şifrə təhlükəsizlik yoxlaması
      if (payload.adminPassword.length < 6) {
        return { success: false, error: "Şifrə ən az 6 simvoldan ibarət olmalıdır" };
      }
      
      // İstifadəçi e-poçt yoxlaması
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.adminEmail)) {
        return { success: false, error: "Düzgün e-poçt formatı daxil edin" };
      }

      try {
        // Admin hesabını yaradaq
        const { data: admin, error: adminError } = await supabase.auth.admin.createUser({
          email: payload.adminEmail,
          password: payload.adminPassword,
          email_confirm: true,
          user_metadata: {
            full_name: payload.adminFullName,
            role: 'schooladmin',
            school_id: newSchool.id
          }
        });

        if (adminError) {
          console.error("Admin yaradılarkən xəta:", adminError);
          return { success: false, error: `Admin yaradıla bilmədi: ${adminError.message}` };
        }

        console.log("Admin uğurla yaradıldı:", admin.user.id);

        // Admin rolunu təyin edək
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: admin.user.id,
            role: 'schooladmin',
            school_id: newSchool.id,
            region_id: regionId,
            sector_id: sectorId
          });

        if (roleError) {
          console.error("Admin rolu yaradılarkən xəta:", roleError);
          return { success: false, error: `Admin rolu yaradıla bilmədi: ${roleError.message}` };
        }

        // Məktəbin admin_email sahəsini yeniləyək
        const { error: updateError } = await supabase
          .from('schools')
          .update({ admin_email: payload.adminEmail })
          .eq('id', newSchool.id);

        if (updateError) {
          console.error("Məktəb admin e-poçtu yenilənərkən xəta:", updateError);
          return { success: false, error: `Məktəb admin e-poçtu yenilənə bilmədi: ${updateError.message}` };
        }

        console.log("Admin məlumatları məktəbə əlavə edildi");

        return {
          success: true,
          data: {
            school: newSchool,
            admin: {
              id: admin.user.id,
              email: payload.adminEmail,
              fullName: payload.adminFullName
            }
          }
        };
      } catch (error: any) {
        console.error("Admin yaratma prosesində xəta:", error);
        return { success: false, error: `Admin yaratma prosesində xəta: ${error.message || error}` };
      }
    }

    // Admin yaradılmayıbsa, yalnız məktəb məlumatlarını qaytaraq
    return {
      success: true,
      data: {
        school: newSchool,
        admin: null
      }
    };
  } catch (error: any) {
    console.error("Məktəb yaratma prosesində ümumi xəta:", error);
    return { success: false, error: `Məktəb yaratma prosesində ümumi xəta: ${error.message || error}` };
  }
}

// Məktəb silmə prosesi
async function deleteSchool(supabase: any, schoolId: string): Promise<SchoolOperationResponse> {
  console.log(`Məktəb silmə prosesi başladı, ID: ${schoolId}`);

  try {
    // Əvvəlcə məktəbin admin e-poçtunu əldə edək
    const { data: school, error: getSchoolError } = await supabase
      .from('schools')
      .select('admin_email')
      .eq('id', schoolId)
      .single();

    if (getSchoolError) {
      console.error("Məktəb məlumatları alınarkən xəta:", getSchoolError);
      return { success: false, error: `Məktəb məlumatları alına bilmədi: ${getSchoolError.message}` };
    }

    // Əgər admin e-poçtu varsa, admin hesabını siləcəyik
    if (school && school.admin_email) {
      // Admin ID-ni e-poçtdan tapaq
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
        filter: `email eq ${school.admin_email}`
      });

      if (!userError && userData && userData.users && userData.users.length > 0) {
        const adminUserId = userData.users[0].id;
        
        // Admin hesabını siləcəyik
        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(adminUserId);
        
        if (deleteUserError) {
          console.error("Admin hesabı silinərkən xəta:", deleteUserError);
          // Xəta olsa belə davam edək, məktəbi silmək daha vacibdir
        } else {
          console.log(`Admin hesabı silindi: ${adminUserId}`);
        }
      } else {
        console.warn(`Admin hesabı tapılmadı: ${school.admin_email}`);
      }
    }

    // Məktəbi siləcəyik
    const { error: deleteSchoolError } = await supabase
      .from('schools')
      .delete()
      .eq('id', schoolId);

    if (deleteSchoolError) {
      console.error("Məktəb silinərkən xəta:", deleteSchoolError);
      return { success: false, error: `Məktəb silinə bilmədi: ${deleteSchoolError.message}` };
    }

    console.log(`Məktəb uğurla silindi: ${schoolId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Məktəb silmə prosesində ümumi xəta:", error);
    return { success: false, error: `Məktəb silmə prosesində ümumi xəta: ${error.message || error}` };
  }
}

// Ana funksiya - HTTP sorğularını emal edir
Deno.serve(async (req) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  
  // CORS preflight sorğularını emal edək
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Supabase müştərisi yaradaq
    const supabase = createSupabaseClient();
    
    // Sorğu məlumatlarını əldə edək
    const payload = await req.json();
    console.log("Sorğu məlumatları:", JSON.stringify(payload));

    // Əməliyyata görə funksiyaları çağıraq
    switch (payload.action) {
      case 'create':
        console.log("Məktəb yaratma funksiyası çağrılır");
        const createResult = await createSchool(supabase, payload);
        return createResponse(createResult.success, createResult.data, createResult.error);
      
      case 'delete':
        console.log("Məktəb silmə funksiyası çağrılır");
        if (!payload.schoolId) {
          return createResponse(false, null, "School ID təyin edilməyib");
        }
        const deleteResult = await deleteSchool(supabase, payload.schoolId);
        return createResponse(deleteResult.success, deleteResult.data, deleteResult.error);
      
      default:
        console.error("Naməlum əməliyyat:", payload.action);
        return createResponse(false, null, `Naməlum əməliyyat: ${payload.action}`);
    }
  } catch (error: any) {
    console.error("Sorğu emal edilərkən ümumi xəta:", error);
    return createResponse(false, null, `Sorğu emal edilərkən ümumi xəta: ${error.message || error}`);
  }
});
