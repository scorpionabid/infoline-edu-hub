
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
  adminName?: string;
  adminPassword?: string;
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
        adminEmail, adminName, adminPassword 
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
      
      // Əgər admin məlumatları verilibsə, admin hesabı yaradaq
      if (adminEmail && adminName) {
        // İstifadəçinin təqdim etdiyi parol və ya default parol
        const password = adminPassword || 'Password123';
        
        console.log(`Creating admin with email: ${adminEmail}, name: ${adminName}, password: ${password.substring(0, 3)}*****`);
        
        try {
          // Email formatını təmizləyək - UTF-8 olmayan simvollar problemlər yarada bilər
          const cleanEmail = adminEmail.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
          
          // Supabase ilə yeni istifadəçi yaradırıq
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: password,
            email_confirm: true, // Emailin təsdiqlənməsinə ehtiyac yoxdur
            user_metadata: {
              full_name: adminName,
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
                data: schoolData, 
                warning: 'Məktəb yaradıldı, lakin admin hesabı yaradıla bilmədi',
                details: userError 
              }),
              { 
                status: 201, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
          
          adminId = userData.user.id;
          
          // Profil yaratma - zəruri deyil, avtomatik trigger tərəfindən yaradılacaq
          // Lakin əmin olmaq üçün yoxlayaq və ya yaradaq
          
          // Profilin yaradılmasını gözləyək - trigger yaradır, amma əmin olaq
          // Kiçik bir gözləmə əlavə edək ki, trigger işləməyə vaxt tapsın
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', adminId)
            .single();
            
          if (profileError || !profileData) {
            console.log('Profil avtomatik yaradılmayıb, manual yaradaq');
            
            // Profil yaratmağa cəhd edirik
            const { error: createProfileError } = await supabaseAdmin
              .from('profiles')
              .insert([
                {
                  id: adminId,
                  full_name: adminName,
                  language: 'az',
                  status: 'active'
                }
              ]);
              
            if (createProfileError) {
              console.error('Profil yaradılması xətası:', createProfileError);
            }
          } else {
            console.log('Profil tapıldı:', profileData);
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
          }
          
          // Əgər admin yaradıldısa, məktəbdə admin_email-i yeniləyək
          const { error: updateSchoolError } = await supabaseAdmin
            .from('schools')
            .update({ admin_email: cleanEmail })
            .eq('id', schoolId);
            
          if (updateSchoolError) {
            console.error('Məktəb admin email yenilənməsi xətası:', updateSchoolError);
          }
          
        } catch (err) {
          console.error('Admin yaradılması prosesində xəta:', err);
          // Məktəbi yaratdıq, amma admin yarada bilmədik
          return new Response(
            JSON.stringify({ 
              success: true, 
              data: schoolData, 
              warning: 'Məktəb yaradıldı, lakin admin hesabı yaradılarkən xəta baş verdi',
              details: err
            }),
            { 
              status: 201, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            school: schoolData, 
            admin: adminId ? { id: adminId, email: adminEmail } : null
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
      
      // Məktəblə bağlı adminləri tapaq
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
      
      // Admin hesablarını deaktiv edək (onları silmək əvəzinə)
      if (roleData && roleData.length > 0) {
        for (const role of roleData) {
          try {
            // İstifadəçini deaktiv edirik, amma silmirik
            await supabaseAdmin
              .from('profiles')
              .update({ status: 'inactive' })
              .eq('id', role.user_id);
            
            console.log(`Admin with id ${role.user_id} deactivated`);
          } catch (err) {
            console.error(`Admin deactivation error for ${role.user_id}:`, err);
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
