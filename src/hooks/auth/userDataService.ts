
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
    
    // İstifadəçinin rolunu əldə edək
    const { data: userRole, error: userRoleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (userRoleError) {
      console.error('User role fetch error:', userRoleError);
    }
    
    const role = userRole?.role || 'schooladmin';

    // İstifadəçinin aid olduğu məktəb, sektor və region məlumatlarını əldə edək
    let schoolData = null;
    let sectorData = null;
    let regionData = null;
    
    if (userRole?.school_id) {
      const { data: school } = await supabase
        .from('schools')
        .select('id, name, sector_id, region_id')
        .eq('id', userRole.school_id)
        .single();
      
      schoolData = school;
      
      if (school && school.sector_id) {
        const { data: sector } = await supabase
          .from('sectors')
          .select('id, name, region_id')
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
    } else if (userRole?.sector_id) {
      // Əgər birbaşa sektorla əlaqəlidirsə
      const { data: sector } = await supabase
        .from('sectors')
        .select('id, name, region_id')
        .eq('id', userRole.sector_id)
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
    } else if (userRole?.region_id) {
      // Əgər birbaşa regionla əlaqəlidirsə
      const { data: region } = await supabase
        .from('regions')
        .select('id, name')
        .eq('id', userRole.region_id)
        .single();
      
      regionData = region;
    }
    
    // Status dəyərini düzəldək
    const statusValue = profile.status || 'active';
    const typedStatus = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
      ? statusValue as 'active' | 'inactive' | 'blocked'
      : 'active' as 'active' | 'inactive' | 'blocked';
    
    // Tam istifadəçi məlumatları obyektini formalaşdıraq
    const fullUserData: FullUserData = {
      id: userId,
      email: authUser.user.email || '',
      role: role,
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      position: profile.position || '',
      language: profile.language || 'az',
      avatar: profile.avatar || '',
      status: typedStatus,
      school: schoolData,
      schoolId: userRole?.school_id || null,
      sector: sectorData,
      sectorId: userRole?.sector_id || null,
      region: regionData,
      regionId: userRole?.region_id || null,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
    
    return fullUserData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
