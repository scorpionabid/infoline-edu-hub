
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight işləmə
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Auth başlığını al
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Authorization başlığı tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Authorization başlığı tapılmadı' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Supabase müştərisini yarat
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    console.log("Supabase URL:", supabaseUrl);
    console.log("Auth header:", authHeader ? "Mövcuddur" : "Yoxdur");
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Request body'ni al
    const requestData = await req.json()
    const { 
      regionName, 
      regionDescription, 
      regionStatus, 
      adminName, 
      adminEmail, 
      adminPassword 
    } = requestData

    console.log('Gələn məlumatlar:', JSON.stringify({ 
      regionName, 
      regionDescription, 
      regionStatus, 
      adminName, 
      adminEmail: adminEmail ? `${adminEmail.substring(0, 3)}...` : undefined 
    }, null, 2));

    if (!regionName) {
      return new Response(
        JSON.stringify({ error: 'Region adı tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Regionun adına görə yoxlanılması
    try {
      const { data: existingRegion, error: regionCheckError } = await supabaseClient
        .from('regions')
        .select('id')
        .eq('name', regionName)
        .maybeSingle()

      if (regionCheckError) {
        console.error('Region yoxlanış xətası:', regionCheckError);
      }

      if (existingRegion) {
        console.log(`"${regionName}" adlı region artıq mövcuddur`);
        return new Response(
          JSON.stringify({ error: `"${regionName}" adlı region artıq mövcuddur` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
    } catch (checkError) {
      console.error('Region mövcudluq yoxlama xətası:', checkError);
    }

    // Əgər admin məlumatları varsa, eyni emailli istifadəçinin yoxlanması
    if (adminEmail) {
      try {
        const { data: existingUser, error: userCheckError } = await supabaseClient.auth.admin.getUserByEmail(adminEmail)
        
        if (userCheckError) {
          console.error('İstifadəçi yoxlama xətası:', userCheckError);
          // Bu xəta daha çox vaxt zərərsizdir - istifadəçi hələ mövcud deyilsə
        } else if (existingUser && existingUser.user) {
          console.log(`"${adminEmail}" email ünvanı ilə istifadəçi artıq mövcuddur`);
          return new Response(
            JSON.stringify({ error: `"${adminEmail}" email ünvanı ilə istifadəçi artıq mövcuddur` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          )
        }
      } catch (error) {
        console.log('İstifadəçi yoxlanarkən xəta:', error);
        // Bu xətanı mütləq qaytarmırıq, bəzən xəta istifadəçinin olmaması mənasına gəlir
      }
    }

    // Yeni region yarat
    try {
      const { data: newRegion, error: regionError } = await supabaseClient
        .from('regions')
        .insert({
          name: regionName,
          description: regionDescription,
          status: regionStatus || 'active'
        })
        .select()
        .single()

      if (regionError) {
        console.error('Region yaradılma xətası:', regionError);
        return new Response(
          JSON.stringify({ error: 'Region yaradılarkən xəta baş verdi', details: regionError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      console.log('Region uğurla yaradıldı:', newRegion);

      // Admin məlumatları varsa, admin istifadəçi yarat
      let adminData = null;
      if (adminEmail && adminName && adminPassword) {
        try {
          console.log('Admin yaradılır...');
          
          // Admin istifadəçi yarat
          const { data: newUser, error: userError } = await supabaseClient.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: {
              full_name: adminName,
              role: 'regionadmin',
              region_id: newRegion.id
            }
          });

          if (userError) {
            console.error('İstifadəçi yaradılma xətası:', userError);
            
            // Xəta baş verdikdə yaradılmış regionu sil
            await supabaseClient
              .from('regions')
              .delete()
              .eq('id', newRegion.id);
            
            return new Response(
              JSON.stringify({ error: 'Admin yaradılarkən xəta baş verdi', details: userError }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }

          console.log('Admin uğurla yaradıldı:', newUser?.user?.id);

          // User_roles cədvəlində yeganəlik yoxlaması
          const { data: existingRole, error: roleCheckError } = await supabaseClient
            .from('user_roles')
            .select('*')
            .eq('user_id', newUser.user.id)
            .eq('role', 'regionadmin')
            .eq('region_id', newRegion.id)
            .maybeSingle();

          if (roleCheckError) {
            console.error('Rol yoxlama xətası:', roleCheckError);
          }

          // Əgər rol mövcud deyilsə, əlavə et
          if (!existingRole) {
            console.log('Rol yaradılır...');
            const { error: roleError } = await supabaseClient
              .from('user_roles')
              .insert({
                user_id: newUser.user.id,
                role: 'regionadmin',
                region_id: newRegion.id
              });

            if (roleError) {
              console.error('Rol yaradılma xətası:', roleError);
            } else {
              console.log('Rol uğurla yaradıldı');
            }
          }

          // Audit loq əlavə et
          try {
            console.log('Audit loq əlavə edilir...');
            await supabaseClient
              .from('audit_logs')
              .insert({
                user_id: newUser.user.id,
                action: 'create',
                entity_type: 'region',
                entity_id: newRegion.id,
                new_value: JSON.stringify({
                  region: newRegion,
                  admin: {
                    id: newUser.user.id,
                    email: adminEmail,
                    name: adminName
                  }
                })
              });
              
            console.log('Audit loq uğurla əlavə edildi');
          } catch (auditError) {
            console.error('Audit loq əlavə edilərkən xəta:', auditError);
          }

          // Update admin_id and admin_email in regions table
          try {
            console.log('Region admin məlumatları yenilənir...');
            await supabaseClient
              .from('regions')
              .update({ 
                admin_id: newUser.user.id,
                admin_email: adminEmail 
              })
              .eq('id', newRegion.id);
              
            console.log('Region admin məlumatları uğurla yeniləndi');
          } catch (updateError) {
            console.error('Region admin məlumatları yenilənərkən xəta:', updateError);
          }
          
          adminData = {
            id: newUser.user.id,
            email: adminEmail,
            name: adminName
          };
        } catch (adminError) {
          console.error('Admin yaratma ümumi xətası:', adminError);
          
          return new Response(
            JSON.stringify({ error: 'Admin yaradılarkən xəta baş verdi', details: adminError?.message || adminError }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      }
      
      // Uğurlu cavab döndər
      return new Response(
        JSON.stringify({ 
          success: true, 
          region: newRegion,
          admin: adminData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (regionCreateError) {
      console.error('Region yaratma prosesində xəta:', regionCreateError);
      return new Response(
        JSON.stringify({ error: 'Region yaradılarkən xəta baş verdi', details: regionCreateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Ümumi xəta:', error);
    return new Response(
      JSON.stringify({ error: 'Gözlənilməz xəta baş verdi', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
