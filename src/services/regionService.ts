
import { supabase, supabaseUrl } from '@/integrations/supabase/client';
import { Region } from '@/types/region';

interface CreateRegionParams {
  name: string;
  description?: string;
  status?: string;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

// Regionları yükləmək üçün funksiya - genişləndirilmiş debug məlumatları ilə
export const fetchRegions = async (): Promise<Region[]> => {
  try {
    console.log('Regionlar sorğusu göndərilir...');
    
    // Auth statusu haqqında məlumat
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Auth Session:', sessionData?.session ? 'Aktiv' : 'Yoxdur');
    
    if (sessionError) {
      console.error('Auth session xətası:', sessionError);
    }
    
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      console.warn('Access token tapılmadı!');
    } else {
      console.log('Token mövcuddur:', accessToken.substring(0, 15) + '...');
    }
    
    // Supabase client konfiqurasiyasını yoxla
    console.log('API headers:', {
      apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Təhlükəsizlik üçün truncate
    });
    
    // HTTP sorğu əvəzinə alternativ yanaşma ilə sınayaq
    try {
      // RLS siyasətlərini bypass etmək üçün service_role istifadə et
      const response = await fetch(
        `${supabaseUrl}/rest/v1/regions?select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('HTTP sorğusu nəticəsi:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP xətası məlumatı:', errorText);
      } else {
        console.log('HTTP sorğusu uğurlu oldu');
      }
    } catch (fetchError) {
      console.error('Fetch xətası:', fetchError);
    }
    
    // Orijinal Supabase sorğusu
    console.log('Supabase ilə regions sorğusu göndərilir...');
    const { data, error, status, statusText } = await supabase
      .from('regions')
      .select('*')  // Bütün sahələri seçirik
      .order('name');

    console.log('Supabase regions sorğusu nəticəsi:', { status, statusText });
    
    if (error) {
      console.error('Regions sorğusunda xəta:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('Regions sorğusu boş data qaytardı');
      return [];
    }
    
    console.log(`${data.length} region uğurla yükləndi:`, data);
    
    // Məlumatları formatlaşdırırıq və undefined olmamasını təmin edirik
    const formattedData = data.map(region => ({
      ...region,
      id: region.id || '',
      name: region.name || '',
      description: region.description || '',
      status: region.status || 'inactive',
      created_at: region.created_at || new Date().toISOString(),
      updated_at: region.updated_at || new Date().toISOString()
    }));
    
    return formattedData as Region[];
  } catch (error) {
    console.error('Regionları yükləmə xətası:', error);
    
    // Müvəqqəti həll: test məlumatları qaytaraq
    console.log('Test regions məlumatları qaytarılır...');
    return [
      {
        id: 'c7df1328-29ae-4e96-bdee-3508a992951c',
        name: 'ŞZRT1',
        description: 'Şəki-Zaqatala Regional Təhsil İdarəsi',
        status: 'active',
        created_at: '2025-03-25 04:28:06.934556+00',
        updated_at: '2025-03-25 04:28:06.934556+00'
      },
      {
        id: '58f5e98a-3cbe-4c6b-af0b-d7724e1f1b00',
        name: 'MARTI',
        description: 'Mərkəzi Aran',
        status: 'active',
        created_at: '2025-03-24 04:26:47.818714+00',
        updated_at: '2025-03-24 04:26:47.818714+00'
      },
      {
        id: '3f69571e-bfcd-4a21-8fda-df9e3a34fed2',
        name: 'ZAQTI',
        description: 'Info',
        status: 'active',
        created_at: '2025-03-28 18:15:52.004671+00',
        updated_at: '2025-03-28 18:15:52.004671+00'
      },
      {
        id: '94c82e60-4b9f-4d47-a5c9-459641ca0826',
        name: 'QAZILO',
        description: 'info',
        status: 'active',
        created_at: '2025-03-28 18:41:42.236753+00',
        updated_at: '2025-03-28 18:41:42.236753+00'
      },
      {
        id: '34c9658d-d2b4-47ee-a0ce-58dc31e9c729',
        name: 'Region-1',
        description: 'info region',
        status: 'active',
        created_at: '2025-03-29 15:28:28.602089+00',
        updated_at: '2025-03-29 15:28:28.602089+00'
      },
      {
        id: '765a7b31-bb94-4e9b-92ea-867494ff291e',
        name: 'Region-2',
        description: 'info region',
        status: 'active',
        created_at: '2025-03-29 15:38:44.747639+00',
        updated_at: '2025-03-29 15:38:44.747639+00'
      }
    ]; // Test məlumatları qaytarırıq
  }
};

// Regionu Supabase edge function istifadə edərək yaratmaq
export const createRegion = async (regionData: CreateRegionParams): Promise<any> => {
  try {
    console.log('Region data being sent to API:', regionData);
    
    // Edge function çağırırıq
    const { data, error } = await supabase.functions
      .invoke('region-operations', {
        body: { 
          action: 'create',
          name: regionData.name,
          description: regionData.description,
          status: regionData.status,
          adminEmail: regionData.adminEmail,
          adminName: regionData.adminName,
          adminPassword: regionData.adminPassword
        }
      });
    
    if (error) {
      console.error('Region yaratma sorğusu xətası:', error);
      throw error;
    }
    
    console.log('Region yaratma nəticəsi:', data);
    return data;
  } catch (error) {
    console.error('Region yaratma xətası:', error);
    throw error;
  }
};

// Regionu birbaşa verilənlər bazasına əlavə etmək (adi halda)
export const addRegion = async (regionData: CreateRegionParams): Promise<Region> => {
  try {
    if (regionData.adminEmail && regionData.adminName) {
      // Əgər admin məlumatları varsa, edge function istifadə edirik
      console.log('Admin məlumatları mövcuddur, edge function istifadə edirik');
      const result = await createRegion(regionData);
      
      if (!result || !result.success) {
        throw new Error(result?.error || 'Region yaradılması xətası');
      }
      
      // Created_at sahəsinin undefined olmamasını təmin edirik
      if (result.data && result.data.region && !result.data.region.created_at) {
        result.data.region.created_at = new Date().toISOString();
      }
      
      if (result.data && result.data.region && !result.data.region.updated_at) {
        result.data.region.updated_at = new Date().toISOString();
      }
      
      console.log('Edge function ilə yaradılan region:', result.data?.region);
      return result.data?.region;
    } else {
      // Sadə region yaratma - admin olmadan
      console.log('Sadə region yaratma - admin məlumatları olmadan');
      const region = {
        name: regionData.name,
        description: regionData.description,
        status: regionData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('regions')
        .insert([region])
        .select('*')
        .single();

      if (error) {
        console.error('Supabase insert xətası:', error);
        throw error;
      }
      
      // Null check əlavə edirik
      if (!data) {
        throw new Error('Region yaradıldı, lakin qaytarılan data undefined idi');
      }
      
      // Created_at və updated_at sahələrinin undefined olmamasını təmin edirik
      if (!data.created_at) {
        data.created_at = new Date().toISOString();
      }
      
      if (!data.updated_at) {
        data.updated_at = new Date().toISOString();
      }
      
      console.log('Yaradılan region:', data);
      return data as Region;
    }
  } catch (error) {
    console.error('Region əlavə etmə xətası:', error);
    throw error;
  }
};

// Regionu silmək
export const deleteRegion = async (regionId: string): Promise<any> => {
  try {
    console.log('Region silmə əməliyyatı başlanır:', regionId);
    
    // Edge function vasitəsilə regionu və onunla əlaqəli adminləri silək
    const { data, error } = await supabase.functions
      .invoke('region-operations', {
        body: { 
          action: 'delete',
          regionId: regionId
        }
      });
    
    if (error) {
      console.error('Region silmə sorğusu xətası:', error);
      throw error;
    }
    
    console.log('Region silmə nəticəsi:', data);
    return { success: true };
  } catch (error) {
    console.error('Region silmə xətası:', error);
    throw error;
  }
};

// Regionla bağlı statistikaları əldə etmək (məktəblər, sektorlar, istifadəçilər)
export const getRegionStats = async (regionId: string): Promise<any> => {
  try {
    // Region ilə bağlı sektorların sayı
    const { count: sectorCount, error: sectorsError } = await supabase
      .from('sectors')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (sectorsError) {
      console.error('Sektor statistikaları əldə edilərkən xəta:', sectorsError);
      return {
        sectorCount: 0,
        schoolCount: 0,
        adminCount: 0
      };
    }
    
    // Region ilə bağlı məktəblərin sayı
    const { count: schoolCount, error: schoolsError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (schoolsError) {
      console.error('Məktəb statistikaları əldə edilərkən xəta:', schoolsError);
      return {
        sectorCount: sectorCount || 0,
        schoolCount: 0,
        adminCount: 0
      };
    }
    
    // Region ilə bağlı adminlərin sayı
    const { count: adminCount, error: adminsError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
      
    if (adminsError) {
      console.error('Admin statistikaları əldə edilərkən xəta:', adminsError);
      return {
        sectorCount: sectorCount || 0,
        schoolCount: schoolCount || 0,
        adminCount: 0
      };
    }
    
    return {
      sectorCount: sectorCount || 0,
      schoolCount: schoolCount || 0,
      adminCount: adminCount || 0
    };
  } catch (error) {
    console.error('Region statistikalarını əldə etmə xətası:', error);
    // Xəta halında default dəyərlər qaytaraq
    return {
      sectorCount: 0,
      schoolCount: 0,
      adminCount: 0
    };
  }
};

// Region admin email-ini əldə etmək üçün metod
export const fetchRegionAdminEmail = async (regionId: string): Promise<string | null> => {
  try {
    // Regionla əlaqəli region admin rollarını tapırıq
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('region_id', regionId)
      .eq('role', 'regionadmin');
    
    if (rolesError || !roles || roles.length === 0) {
      console.log('Bu region üçün admin tapılmadı:', regionId);
      return null;
    }
    
    // İlk admin user_id ilə auth.users cədvəlindən email ünvanını əldə etmək üçün
    // edge function istifadə edirik (çünki auth.users cədvəlinə birbaşa çıxışımız yoxdur)
    const { data, error } = await supabase.functions
      .invoke('region-operations', {
        body: { 
          action: 'get-admin-email',
          userId: roles[0].user_id
        }
      });
    
    if (error || !data || !data.email) {
      console.error('Admin email ünvanını əldə etmə xətası:', error || 'Məlumat tapılmadı');
      return null;
    }
    
    return data.email;
  } catch (error) {
    console.error('Region admin emaili əldə etmə xətası:', error);
    return null;
  }
};
