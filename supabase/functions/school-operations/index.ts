
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
  regionId?: string;  // regionId və sectorId formatını da qəbul edirik
  sectorId?: string;
  region_id?: string; // region_id və sector_id formatını da qəbul edirik
  sector_id?: string;
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
      console.error('Supabase konfiqurasiya dəyərləri yoxdur:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
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
    console.log('Request data:', JSON.stringify(data));

    // Dispatch based on action type
    if (action === 'create') {
      const createData = data as CreateSchoolRequest;
      
      // regionId/region_id və sectorId/sector_id parametrləri birlikdə işləmək üçün
      const regionId = createData.regionId || createData.region_id;
      const sectorId = createData.sectorId || createData.sector_id;
      
      const { 
        name, principalName, address, phone, email,
        studentCount, teacherCount, status, type, language,
        adminEmail, adminFullName, adminPassword, adminStatus 
      } = createData;
      
      if (!name || !regionId || !sectorId) {
        console.error('Məcburi sahələr çatışmır:', { name, regionId, sectorId });
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
      console.log(`Məktəb yaradıldı, ID: ${schoolId}`);
      let adminId = null;
      let adminData = null;
      
      // Əgər admin məlumatları verilibsə, admin hesabı yaradaq
      if (adminEmail && adminFullName && adminPassword) {
        console.log(`Admin yaradılır: ${adminEmail}, ${adminFullName}, şifrə uzunluğu: ${adminPassword.length}`);
        
        try {
          // Email formatını təmizləyək - UTF-8 olmayan simvollar problemlər yarada bilər
          const cleanEmail = adminEmail.trim().toLowerCase();
          
          // Əvvəlcə emailin istifadədə olub-olmadığını yoxlayaq
          const { data: existingUsers } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('email', cleanEmail)
            .maybeSingle();
          
          if (existingUsers) {
            console.warn(`${cleanEmail} email ünvanı artıq istifadədədir. Yeni istifadəçi yaradılmayacaq.`);
            return new Response(
              JSON.stringify({ 
                success: true, 
                data: {
                  school: schoolData, 
                  warning: `${cleanEmail} email ünvanı artıq istifadədədir. Yeni istifadəçi yaradılmayacaq.`
                }
              }),
              { 
                status: 201, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
          
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
          
          console.log('Admin uğurla yaradıldı:', userData.user.id);
          adminId = userData.user.id;
          adminData = userData;
          
          // Profilin yaradılması üçün handle_new_user triggeri işləyir
          // Buna baxmayaraq, biz əmin olmaq istəyirik ki, profile məlumatları düzgün doldurulub
          // Kiçik bir gözləmə əlavə edək ki, trigger işləməyə vaxt tapsın
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Profile məlumatlarını yoxlayaq və yeniləyək (əgər lazımdırsa)
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', adminId)
            .maybeSingle();
          
          if (profileError || !profileData) {
            console.log('Profile məlumatları tapılmadı, manual yaradaq');
            
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
              console.log(`İstifadəçi ${adminId} üçün profil yaradıldı`);
            }
          } else if (profileData) {
            // Profil var, amma tam məlumatları yeniləməyə ehtiyac ola bilər
            const { error: updateProfileError } = await supabaseAdmin
              .from('profiles')
              .update({
                full_name: adminFullName,
                email: cleanEmail,
                status: adminStatus || 'active'
              })
              .eq('id', adminId);
              
            if (updateProfileError) {
              console.error('Profil yenilənməsi xətası:', updateProfileError);
            } else {
              console.log(`İstifadəçi ${adminId} üçün profil yeniləndi`);
            }
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
            console.log(`İstifadəçi ${adminId} üçün rol əlavə edildi`);
          }
          
          // Əgər admin yaradıldısa, məktəbdə admin_email-i yeniləyək
          const { error: updateSchoolError } = await supabaseAdmin
            .from('schools')
            .update({ admin_email: cleanEmail })
            .eq('id', schoolId);
            
          if (updateSchoolError) {
            console.error('Məktəb admin email yenilənməsi xətası:', updateSchoolError);
          } else {
            console.log(`Məktəb admin_email ${cleanEmail} olaraq yeniləndi`);
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
        // Əvvəlcə profiles cədvəlində admin e-poçtunu axtaraq
        const { data: profileData } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', schoolData.admin_email)
          .maybeSingle();
          
        if (profileData) {
          adminUserId = profileData.id;
          console.log(`Admin profili tapıldı: ${adminUserId}`);
        } else {
          // Profildə tapılmasa, auth.users-da axtaraq
          try {
            const { data } = await supabaseAdmin.auth.admin.listUsers({
              filter: {
                email: schoolData.admin_email
              }
            });
            
            if (data?.users?.length > 0) {
              adminUserId = data.users[0].id;
              console.log(`Admin auth.users-da tapıldı: ${adminUserId}`);
            }
          } catch (authError) {
            console.error('Admin axtarışı zamanı xəta:', authError);
          }
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
            console.error(`Admin deaktiv etmə xətası (${adminUserId}):`, profileUpdateError);
          } else {
            console.log(`Admin ${adminUserId} deaktiv edildi`);
          }
        } catch (err) {
          console.error(`Admin deaktiv etmə xətası (${adminUserId}):`, err);
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
                console.error(`Admin deaktiv etmə xətası (${role.user_id}):`, profileUpdateError);
              } else {
                console.log(`Admin ${role.user_id} deaktiv edildi`);
              }
            } catch (err) {
              console.error(`Admin deaktiv etmə xətası (${role.user_id}):`, err);
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
