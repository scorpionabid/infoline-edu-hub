
import { supabase } from '@/integrations/supabase/client';
import { CreateUserData, FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { getUser } from './userFetch';

// Yeni istifadəçi yarat
export const createUser = async (userData: CreateUserData): Promise<FullUserData | null> => {
  try {
    // Supabase admin funksiyasını simulyasiya edirik
    // Həqiqi layihədə bu Edge Function vasitəsilə yerinə yetirilməlidir
    const mockUserId = `${Math.random().toString(36).substring(2, 15)}`;
    
    // İstifadəçi yaratdıqdan sonra profil və rol dataları avtomatik trigger ilə yaradılacaq
    // Bu yalnız demo məqsədilə profil və rolu manual yaratmaq üçündür
    
    // Profil yarat
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: mockUserId,
        full_name: userData.full_name,
        phone: userData.phone,
        position: userData.position,
        language: userData.language || 'az',
        avatar: userData.avatar, // Avatar artıq CreateUserData interfeysinə əlavə edildi
        status: (userData.status || 'active') as 'active' | 'inactive' | 'blocked'
      });
    
    if (profileError) throw profileError;
    
    // Rol yarat
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: mockUserId,
        role: userData.role,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id
      });
    
    if (roleError) throw roleError;
    
    // Yeni yaradılmış istifadəçini əldə et
    const newUser = await getUser(mockUserId);
    
    toast.success('İstifadəçi uğurla yaradıldı', {
      description: `${userData.full_name} adlı istifadəçi yaradıldı`
    });
    
    return newUser;
  } catch (error: any) {
    console.error('İstifadəçi yaradarkən xəta baş verdi:', error);
    
    toast.error('İstifadəçi yaradılarkən xəta baş verdi', {
      description: error.message
    });
    
    return null;
  }
};
