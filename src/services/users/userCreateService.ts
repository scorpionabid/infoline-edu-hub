
import { supabase } from '@/integrations/supabase/client';
import { CreateUserData, FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { addAuditLog } from '@/hooks/auth/userDataService';
import { getUser } from './userFetchService';

// Yeni istifadəçi yarat
export const createUser = async (userData: CreateUserData): Promise<FullUserData | null> => {
  try {
    // Əvvəlki məlumatları saxlayaq audit üçün
    const oldData = null;
    
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
        avatar: userData.avatar,
        status: (userData.status || 'active') as 'active' | 'inactive' | 'blocked'
      });
    
    if (profileError) throw profileError;
    
    // Rol yarat - rolu any kimi cast edirik ki, tipi dəyişdirilə bilsin
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: mockUserId,
        role: userData.role as any,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id
      });
    
    if (roleError) throw roleError;
    
    // Yeni yaradılmış istifadəçini əldə et
    const newUser = await getUser(mockUserId);
    
    // Audit log əlavə et
    await addAuditLog(
      'create',
      'user',
      mockUserId,
      oldData,
      {
        full_name: userData.full_name,
        role: userData.role,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id
      }
    );
    
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
