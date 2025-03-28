
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

export const fetchUserData = async (userId: string): Promise<FullUserData> => {
  try {
    // Əsas istifadəçi məlumatlarını əldə edək
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth user fetch error:', authError);
      throw authError;
    }
    
    if (!authUser.user) {
      throw new Error('İstifadəçi tapılmadı');
    }
    
    // Profil məlumatlarını əldə edək
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw profileError;
    }
    
    if (!profile) {
      throw new Error('İstifadəçi profili tapılmadı');
    }
    
    // İstifadəçinin aid olduğu məktəb, sektor və region məlumatlarını əldə edək
    let schoolData = null;
    let sectorData = null;
    let regionData = null;
    
    if (profile.school_id) {
      const { data: school } = await supabase
        .from('schools')
        .select('id, name')
        .eq('id', profile.school_id)
        .single();
      
      schoolData = school;
      
      if (school && school.sector_id) {
        const { data: sector } = await supabase
          .from('sectors')
          .select('id, name')
          .eq('id', school.sector_id)
          .single();
        
        sectorData = sector;
        
        if (sector && sector.region_id) {
          const { data: region } = await supabase
            .from('regions')
            .select('id, name')
            .eq('id', sector.region_id)
            .single();
          
          regionData = region;
        }
      }
    }
    
    // Tam istifadəçi məlumatları obyektini formalaşdıraq
    const fullUserData: FullUserData = {
      id: userId,
      email: authUser.user.email || '',
      role: profile.role || 'schooladmin',
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      position: profile.position || '',
      language: profile.language || 'az',
      avatar: profile.avatar || '',
      status: profile.status || 'active',
      school: schoolData,
      schoolId: profile.school_id || null,
      sector: sectorData,
      sectorId: sectorData?.id || null,
      region: regionData,
      regionId: regionData?.id || null,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
    
    return fullUserData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
