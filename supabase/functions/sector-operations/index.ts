
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSectorRequest {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  regionId: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

interface DeleteSectorRequest {
  sectorId: string;
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

    const { path, method } = req;
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    console.log(`Sector operations function called with action: ${action}, method: ${method}`);

    if (method === 'POST') {
      const requestData = await req.json();
      console.log('Request data:', requestData);

      // Sektorun yaradılması
      if (requestData.action === 'create') {
        const { name, description, status, regionId, adminEmail, adminName, adminPassword } = requestData as CreateSectorRequest;
        
        if (!name || !regionId) {
          return new Response(
            JSON.stringify({ error: 'Sektor adı və Region ID tələb olunur' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log(`Creating sector "${name}" for region ${regionId}`);
        
        // İlk öncə sektoru yaradaq
        const { data: sectorData, error: sectorError } = await supabaseAdmin
          .from('sectors')
          .insert([
            { 
              name, 
              description: description || null, 
              status: status || 'active',
              region_id: regionId
            }
          ])
          .select()
          .single();
        
        if (sectorError) {
          console.error('Sektor yaradılması xətası:', sectorError);
          return new Response(
            JSON.stringify({ error: 'Sektor yaradılması xətası', details: sectorError }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        const sectorId = sectorData.id;
        console.log(`Sector created with ID: ${sectorId}`);
        let adminId = null;
        let adminEmailResult = null;
        
        // Əgər admin məlumatları verilibsə, admin hesabı yaradaq
        if (adminEmail && adminName) {
          // İstifadəçinin təqdim etdiyi parol və ya default parol
          const password = adminPassword || 'Password123';
          
          console.log(`Creating admin with email: ${adminEmail}, name: ${adminName}`);
          
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
                role: 'sectoradmin',
                region_id: regionId,
                sector_id: sectorId
              }
            });
            
            if (userError) {
              console.error('Admin hesabı yaradılması xətası:', userError);
              // Sektoru yaratdıq, amma admin yarada bilmədik
              return new Response(
                JSON.stringify({ 
                  success: true, 
                  data: {
                    sector: sectorData, 
                    warning: 'Sektor yaradıldı, lakin admin hesabı yaradıla bilmədi',
                    details: userError 
                  }
                }),
                { 
                  status: 201, 
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
                }
              );
            }
            
            adminId = userData.user.id;
            adminEmailResult = cleanEmail;
            console.log(`Admin created with ID: ${adminId} and email: ${adminEmailResult}`);
            
            // Profilin yaradılmasını gözləyək - trigger yaradır, amma əmin olaq
            // Kiçik bir gözləmə əlavə edək ki, trigger işləməyə vaxt tapsın
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Profili yoxlayaq və ya yaradaq
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
                    email: cleanEmail,
                    language: 'az',
                    status: 'active'
                  }
                ]);
                
              if (createProfileError) {
                console.error('Profil yaradılması xətası:', createProfileError);
              } else {
                console.log(`Profile manually created for admin ID: ${adminId}`);
              }
            } else {
              console.log('Profil tapıldı:', profileData);
            }
            
            // İstifadəçi rolunu əlavə edirik
            const { error: roleError } = await supabaseAdmin
              .from('user_roles')
              .insert([
                {
                  user_id: adminId,
                  role: 'sectoradmin',
                  region_id: regionId,
                  sector_id: sectorId
                }
              ]);
            
            if (roleError) {
              console.error('Rol əlavə edilməsi xətası:', roleError);
            } else {
              console.log(`Role 'sectoradmin' assigned to user ID: ${adminId}`);
            }
          } catch (err) {
            console.error('Admin yaradılması prosesində xəta:', err);
            // Sektoru yaratdıq, amma admin yarada bilmədik
            return new Response(
              JSON.stringify({ 
                success: true, 
                data: {
                  sector: sectorData, 
                  warning: 'Sektor yaradıldı, lakin admin hesabı yaradılarkən xəta baş verdi',
                  details: err
                }
              }),
              { 
                status: 201, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
        }
        
        console.log('Sector creation process completed successfully');
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { 
              sector: sectorData, 
              adminId: adminId,
              adminEmail: adminEmailResult
            } 
          }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } 
      // Sektorun silinməsi
      else if (requestData.action === 'delete') {
        const { sectorId } = requestData as DeleteSectorRequest;
        
        if (!sectorId) {
          return new Response(
            JSON.stringify({ error: 'Sektor ID tələb olunur' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        console.log(`Deleting sector with ID: ${sectorId}`);
        
        // Sektorla bağlı adminləri tapaq
        const { data: roleData } = await supabaseAdmin
          .from('user_roles')
          .select('user_id')
          .eq('sector_id', sectorId)
          .eq('role', 'sectoradmin');
        
        if (roleData && roleData.length > 0) {
          console.log(`Found ${roleData.length} admin(s) associated with the sector`);
        }
        
        // Sektor ilə əlaqəli digər məlumatları silirik
        // Avtomatik cascade delete işləyəcək, əgər foreign key məhdudiyyətləri varsa
        const { error: deleteError } = await supabaseAdmin
          .from('sectors')
          .delete()
          .eq('id', sectorId);
        
        if (deleteError) {
          console.error('Sektor silmə xətası:', deleteError);
          return new Response(
            JSON.stringify({ error: 'Sektor silinməsi xətası', details: deleteError }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        console.log(`Sector with ID: ${sectorId} deleted successfully`);
        
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
          JSON.stringify({ success: true, message: 'Sektor uğurla silindi' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
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
