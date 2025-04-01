
import { supabase } from '@/integrations/supabase/client';
import { Sector } from '@/types/sector';

// Sektor yaratmaq üçün parametrlər
export interface CreateSectorParams {
  name: string;
  description?: string;
  regionId: string;
  status?: 'active' | 'inactive';
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

// Sektorları yükləmək üçün funksiya
export const fetchSectors = async (regionId?: string): Promise<Sector[]> => {
  try {
    console.log('Sektorlar sorğusu göndərilir...', regionId ? `Region ID: ${regionId}` : 'Bütün regionlar üçün');
    
    // Sektorları birbaşa əldə et
    let query = supabase
      .from('sectors')
      .select('*')
      .order('name');
    
    // Əgər regionId varsa, filtrlə
    if (regionId) {
      query = query.eq('region_id', regionId);
      console.log(`Region ID ilə filtrlənir: ${regionId}`);
    }
    
    const { data: sectors, error } = await query;
    
    if (error) {
      console.error('Sektorları yükləmə xətası:', error);
      throw error;
    }
    
    if (!sectors || sectors.length === 0) {
      console.log('Heç bir sektor tapılmadı');
      return [];
    }
    
    console.log(`${sectors.length} sektor tapıldı, admin emailləri əldə edilir...`);
    
    // Regionların adlarını əldə et
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('id, name');
      
    const regionNames = regionsError || !regions ? {} : 
      regions.reduce((acc: Record<string, string>, region: any) => {
        acc[region.id] = region.name;
        return acc;
      }, {});
    
    // Hər bir sektor üçün admin email-lərini ayrı-ayrı sorğular ilə əldə et
    // Bu, sonsuz rekursiya problemini həll edəcək
    const formattedSectors = await Promise.all(sectors.map(async (sector) => {
      const adminEmail = await fetchSectorAdminEmail(sector.id);
      const regionName = regionNames[sector.region_id] || "Bilinmir";
      
      return {
        ...sector,
        adminEmail,
        regionName,
        schoolCount: 0, // Bu məlumatlar başqa sorğu ilə əldə edilə bilər
        adminCount: adminEmail ? 1 : 0,
        completionRate: Math.floor(Math.random() * 100) // Hələlik təsadüfi dəyər
      };
    }));
    
    console.log('Formatlanmış sektorlar:', formattedSectors);
    return formattedSectors as Sector[];
  } catch (error) {
    console.error('Sektorları əldə edərkən ümumi xəta:', error);
    throw error;
  }
};

// Sektoru yaratmaq
export const addSector = async (sectorData: CreateSectorParams): Promise<Sector> => {
  try {
    console.log('Sektor əlavə edilir:', sectorData);
    
    // Edge function vasitəsilə sektoru və admini yaradaq
    const { data, error } = await supabase.functions
      .invoke('sector-operations', {
        body: { 
          action: 'create',
          name: sectorData.name,
          description: sectorData.description || null,
          regionId: sectorData.regionId,
          status: sectorData.status || 'active',
          adminEmail: sectorData.adminEmail,
          adminName: sectorData.adminName,
          adminPassword: sectorData.adminPassword
        }
      });
    
    if (error) {
      console.error('Sektor yaratma sorğusu xətası:', error);
      throw error;
    }
    
    console.log('Sektor yaratma nəticəsi:', data);
    
    // Edge function-dan qaytarılan məlumatları formalaşdır
    if (data && data.data && data.data.sector) {
      // Region adını əldə et
      const { data: regionData } = await supabase
        .from('regions')
        .select('name')
        .eq('id', data.data.sector.region_id)
        .single();
      
      const regionName = regionData?.name || 'Bilinmir';
      
      const newSector = {
        ...data.data.sector,
        regionName,
        adminEmail: data.data.adminEmail || null,
        admin_id: data.data.adminId || null,
        adminCount: data.data.adminId ? 1 : 0,
        schoolCount: 0,
        completionRate: 0,
        status: data.data.sector.status as 'active' | 'inactive'
      };
      
      console.log('Formatlanmış yeni sektor:', newSector);
      return newSector;
    } else {
      // Xəta halında boş obyekt qaytar
      throw new Error('Sektor yaradıldı, amma məlumatlar qaytarılmadı');
    }
  } catch (error) {
    console.error('Sektor əlavə etmə xətası:', error);
    throw error;
  }
};

// Sektoru silmək
export const deleteSector = async (sectorId: string): Promise<any> => {
  try {
    console.log(`Sektor siliniyor: ${sectorId}`);
    
    // Edge function vasitəsilə sektoru silək
    const { data, error } = await supabase.functions
      .invoke('sector-operations', {
        body: { 
          action: 'delete',
          sectorId: sectorId
        }
      });
    
    if (error) {
      console.error('Sektor silmə sorğusu xətası:', error);
      throw error;
    }
    
    console.log('Sektor silmə nəticəsi:', data);
    return { success: true, message: 'Sektor uğurla silindi' };
  } catch (error) {
    console.error('Sektor silmə xətası:', error);
    throw error;
  }
};

// Sektor admin email-ini əldə etmək üçün metod
// Bu, bir funksiya ilə rekursiya olmadan admin e-poçtunu əldə edir
export const fetchSectorAdminEmail = async (sectorId: string): Promise<string | null> => {
  try {
    // Edge function əvəzinə birbaşa SQL funksiya və ya sadə sorğu istifadə edə bilərsiz
    // burada security definer istifadə edən bir SQL funksiyasını çağırmaq ideal olar
    // Lakin sadəlik üçün birbaşa, təhlükəsiz bir sorğu ilə əldə edək:
    const { data: profiles, error } = await supabase
      .rpc('get_sector_admin_email', {
        sector_id_param: sectorId
      });
    
    if (error) {
      console.error('Sektor admin e-poçtu sorğusu xətası:', error);
      return null;
    }
    
    // Əgər profil tapılıbsa və email mövcuddursa, qaytarın
    if (profiles && profiles.length > 0) {
      return profiles[0].email;
    }
    
    return null;
  } catch (error) {
    console.error('Sektor admin e-poçtu əldə etmə xətası:', error);
    return null;
  }
};
