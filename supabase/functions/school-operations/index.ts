
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSchoolRequest {
  name: string;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  regionId: string;
  sectorId: string;
  studentCount?: number;
  teacherCount?: number;
  status?: string;
  type?: string;
  language?: string;
  adminEmail?: string;
  adminFullName?: string;
  adminPassword?: string;
  adminStatus?: string;
}

interface DeleteSchoolRequest {
  schoolId: string;
}

serve(async (req) => {
  // CORS sorğusu üçün
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Supabase admin client yaratma
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Parse request data
    const requestData = await req.json();
    const { action, ...data } = requestData;
    
    console.log(`School operations function called with action: ${action}`);
    console.log('Request data:', data);

    // Dispatch based on action type
    if (action === 'create') {
      const { 
        name, principalName, address, phone, email, regionId, sectorId,
        studentCount, teacherCount, status, type, language,
        adminEmail, adminFullName, adminPassword, adminStatus 
      } = data as CreateSchoolRequest;
      
      if (!name || !regionId || !sectorId) {
        return new Response(
          JSON.stringify({ error: 'Məktəb adı, Region ID və Sektor ID tələb olunur' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // İlk öncə məktəbi yaradaq
      const { data: schoolData, error: schoolError } = await supabaseAdmin
        .from('schools')
        .insert([
          { 
            name, 
            principal_name: principalName || null,
            address: address || null,
            phone: phone || null,
            email: email || null,
            region_id: regionId,
            sector_id: sectorId,
            student_count: studentCount || null,
            teacher_count: teacherCount || null,
            status: status || 'active',
            type: type || null,
            language: language || null,
            admin_email: adminEmail || null
          }
        ])
        .select()
        .single();
      
      if (schoolError) {
        console.error('Məktəb yaradılması xətası:', schoolError);
        return new Response(
          JSON.stringify({ error: 'Məktəb yaradılması xətası', details: schoolError }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const schoolId = schoolData.id;
      let adminId = null;
      let adminData = null;
      
      // Əgər admin məlumatları verilibsə, admin hesabı yaradaq
      if (adminEmail && adminFullName && adminPassword) {
        console.log(`Creating admin with email: ${adminEmail}, name: ${adminFullName}, password length: ${adminPassword.length}`);
        
        try {
          // Email formatını təmizləyək - UTF-8 olmayan simvollar problemlər yarada bilər
          const cleanEmail = adminEmail.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
          
          // Supabase ilə yeni istifadəçi yaradırıq
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
              full_name: adminFullName,
              role: 'schooladmin',
              region_id: regionId,
              sector_id: sectorId,
              school_id: schoolId
            }
          });
          
          if (userError) {
            console.error('Admin hesabı yaradılması xətası:', userError);
            // Məktəbi yaratdıq, amma admin yarada bilmədik
            return new Response(
              JSON.stringify({ 
                success: true, 
                data: { school: schoolData }, 
                warning: 'Məktəb yaradıldı, lakin admin hesabı yaradıla bilmədi',
                details: userError 
              }),
              { 
                status: 201, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
          
          console.log('Admin created successfully:', userData.user.id);
          adminId = userData.user.id;
          adminData = userData;
          
          // Profil yaratmağa çəhd edirik
          const { error: createProfileError } = await supabaseAdmin
            .from('profiles')
            .insert([
              {
                id: adminId,
                full_name: adminFullName,
                language: 'az',
                status: adminStatus || 'active',
                email: cleanEmail
              }
            ]);
            
          if (createProfileError) {
            console.error('Profil yaradılması xətası:', createProfileError);
          } else {
            console.log(`Profile created for user ${adminId}`);
          }
          
          // İstifadəçi rolunu əlavə edək
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert([
              {
                user_id: adminId,
                role: 'schooladmin',
                region_id: regionId,
                sector_id: sectorId,
                school_id: schoolId
              }
            ]);
            
          if (roleError) {
            console.error('Rol əlavə edilməsi xətası:', roleError);
          } else {
            console.log(`Role added for user ${adminId}`);
          }
          
          // Əgər admin yaradıldısa, məktəbdə admin_email-i yeniləyək
          const { error: updateSchoolError } = await supabaseAdmin
            .from('schools')
            .update({ admin_email: cleanEmail })
            .eq('id', schoolId);
            
          if (updateSchoolError) {
            console.error('Məktəb admin email yenilənməsi xətası:', updateSchoolError);
          } else {
            console.log(`School admin_email updated to ${cleanEmail}`);
          }
          
        } catch (err) {
          console.error('Admin yaradılması prosesində xəta:', err);
          // Məktəbi yaratdıq, amma admin yarada bilmədik
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: { school: schoolData }, 
              warning: 'Məktəb yaradıldı, lakin admin hesabı yaradılarkən xəta baş verdi',
              details: err
            }),
            { 
              status: 201, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else if (adminEmail) {
        console.error('Admin yaratmaq üçün email, şifrə və ad lazımdır');
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { school: schoolData }, 
            warning: 'Admin yaratmaq üçün email, şifrə və tam ad lazımdır'
          }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            school: schoolData, 
            admin: adminId ? { id: adminId, email: adminEmail, data: adminData } : null
          } 
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } 
    // Məktəbin silinməsi
    else if (action === 'delete') {
      const { schoolId } = data as DeleteSchoolRequest;
      
      if (!schoolId) {
        return new Response(
          JSON.stringify({ error: 'Məktəb ID tələb olunur' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Məktəbin məlumatlarını və admin e-poçtunu alaq
      const { data: schoolData, error: schoolFetchError } = await supabaseAdmin
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
        
      if (schoolFetchError) {
        console.error('Məktəb məlumatları alınarkən xəta:', schoolFetchError);
        return new Response(
          JSON.stringify({ error: 'Məktəb məlumatları alınarkən xəta', details: schoolFetchError }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Admin e-poçtu ilə istifadəçini tapaq
      let adminUserId = null;
      if (schoolData.admin_email) {
        const { data: adminData } = await supabaseAdmin.auth.admin
          .listUsers({ 
            filter: { email: schoolData.admin_email } 
          });
          
        if (adminData && adminData.users && adminData.users.length > 0) {
          adminUserId = adminData.users[0].id;
        }
      }
      
      // Məktəb ilə əlaqəli rolları tapaq
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('user_id')
        .eq('school_id', schoolId)
        .eq('role', 'schooladmin');
      
      // Məktəb ilə əlaqəli digər məlumatları silirik
      // Avtomatik cascade delete işləyəcək, əgər foreign key məhdudiyyətləri varsa
      const { error: deleteError } = await supabaseAdmin
        .from('schools')
        .delete()
        .eq('id', schoolId);
      
      if (deleteError) {
        console.error('Məktəb silmə xətası:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Məktəb silinməsi xətası', details: deleteError }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Admin hesabını deaktiv edək
      if (adminUserId) {
        try {
          // İstifadəçini deaktiv edirik
          const { error: profileUpdateError } = await supabaseAdmin
            .from('profiles')
            .update({ status: 'inactive' })
            .eq('id', adminUserId);
            
          if (profileUpdateError) {
            console.error(`Admin deactivation error for ${adminUserId}:`, profileUpdateError);
          } else {
            console.log(`Admin with id ${adminUserId} deactivated`);
          }
        } catch (err) {
          console.error(`Admin deactivation error for ${adminUserId}:`, err);
        }
      }
      
      // Əlavə olaraq rollar ilə əlaqəli adminləri də deaktiv edək
      if (roleData && roleData.length > 0) {
        for (const role of roleData) {
          if (role.user_id !== adminUserId) { // Əgər yuxarıda işləmişiksə, təkrar etməyək
            try {
              // İstifadəçini deaktiv edirik
              const { error: profileUpdateError } = await supabaseAdmin
                .from('profiles')
                .update({ status: 'inactive' })
                .eq('id', role.user_id);
                
              if (profileUpdateError) {
                console.error(`Admin deactivation error for ${role.user_id}:`, profileUpdateError);
              } else {
                console.log(`Admin with id ${role.user_id} deactivated`);
              }
            } catch (err) {
              console.error(`Admin deactivation error for ${role.user_id}:`, err);
            }
          }
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Məktəb uğurla silindi' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Digər sorğu növlərinə cavab
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Server xətası', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
