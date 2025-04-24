import { supabase, callEdgeFunction } from '@/integrations/supabase/client';
import { UserCreateData, UserRole } from '@/types/supabase';
import { toast } from 'sonner';

// İstifadəçi yaratma funksiyası
export const createUser = async (userData: UserCreateData): Promise<{ success: boolean; userId?: string; error?: any }> => {
  try {
    console.log('İstifadəçi yaratma prosesi başladı:', {
      email: userData.email,
      role: userData.role
    });
    
    // Edge Function ilə istifadəçi yaradaq
    const { data, error } = await callEdgeFunction<{ user_id: string }>('create-user', {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      language: userData.language || 'az',
      role: userData.role,
      regionId: userData.regionId || null,
      sectorId: userData.sectorId || null,
      schoolId: userData.schoolId || null,
      status: userData.status || 'active'
    });
    
    if (error) {
      console.error('Edge Function xətası (create-user):', error);
      
      // Xəta mesajını müəyyən edək
      let errorMessage = 'İstifadəçi yaradılarkən xəta baş verdi';
      
      if (typeof error === 'object' && error.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Bu email ünvanı ilə istifadəçi artıq mövcuddur';
        } else if (error.message.includes('invalid email')) {
          errorMessage = 'Yanlış email formatı';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error('İstifadəçi yaradıla bilmədi', {
        description: errorMessage
      });
      
      return { success: false, error };
    }
    
    if (!data || !data.user_id) {
      console.error('Edge Function cavabında user_id tapılmadı');
      
      toast.error('İstifadəçi yaradıla bilmədi', {
        description: 'Server cavabında istifadəçi ID-si tapılmadı'
      });
      
      return { success: false, error: new Error('Server cavabında istifadəçi ID-si tapılmadı') };
    }
    
    console.log('İstifadəçi uğurla yaradıldı, ID:', data.user_id);
    
    // Əgər region admin yaradılırsa, region təyin edək
    if (userData.role === 'regionadmin' && userData.regionId) {
      try {
        console.log('Region admin təyin edilir:', {
          userId: data.user_id,
          regionId: userData.regionId
        });
        
        const { data: assignData, error: assignError } = await callEdgeFunction('assign-region-admin', {
          userId: data.user_id,
          regionId: userData.regionId
        });
        
        if (assignError) {
          console.error('Region admin təyin etmə xətası:', assignError);
          
          toast.error('Region admin təyin edilə bilmədi', {
            description: 'İstifadəçi yaradıldı, lakin region admin təyin edilə bilmədi'
          });
        } else {
          console.log('Region admin uğurla təyin edildi');
        }
      } catch (assignError) {
        console.error('Region admin təyin etmə xətası:', assignError);
        
        toast.error('Region admin təyin edilə bilmədi', {
          description: 'İstifadəçi yaradıldı, lakin region admin təyin edilə bilmədi'
        });
      }
    }
    
    // Əgər sector admin yaradılırsa, sector təyin edək
    if (userData.role === 'sectoradmin' && userData.sectorId) {
      try {
        console.log('Sector admin təyin edilir:', {
          userId: data.user_id,
          sectorId: userData.sectorId
        });
        
        const { data: assignData, error: assignError } = await callEdgeFunction('assign-sector-admin', {
          userId: data.user_id,
          sectorId: userData.sectorId
        });
        
        if (assignError) {
          console.error('Sector admin təyin etmə xətası:', assignError);
          
          toast.error('Sector admin təyin edilə bilmədi', {
            description: 'İstifadəçi yaradıldı, lakin sector admin təyin edilə bilmədi'
          });
        } else {
          console.log('Sector admin uğurla təyin edildi');
        }
      } catch (assignError) {
        console.error('Sector admin təyin etmə xətası:', assignError);
        
        toast.error('Sector admin təyin edilə bilmədi', {
          description: 'İstifadəçi yaradıldı, lakin sector admin təyin edilə bilmədi'
        });
      }
    }
    
    // Əgər school admin yaradılırsa, school təyin edək
    if (userData.role === 'schooladmin' && userData.schoolId) {
      try {
        console.log('School admin təyin edilir:', {
          userId: data.user_id,
          schoolId: userData.schoolId
        });
        
        const { data: assignData, error: assignError } = await callEdgeFunction('assign-school-admin', {
          userId: data.user_id,
          schoolId: userData.schoolId
        });
        
        if (assignError) {
          console.error('School admin təyin etmə xətası:', assignError);
          
          toast.error('School admin təyin edilə bilmədi', {
            description: 'İstifadəçi yaradıldı, lakin school admin təyin edilə bilmədi'
          });
        } else {
          console.log('School admin uğurla təyin edildi');
        }
      } catch (assignError) {
        console.error('School admin təyin etmə xətası:', assignError);
        
        toast.error('School admin təyin edilə bilmədi', {
          description: 'İstifadəçi yaradıldı, lakin school admin təyin edilə bilmədi'
        });
      }
    }
    
    toast.success('İstifadəçi uğurla yaradıldı', {
      description: `${userData.fullName} (${userData.email}) sistemə əlavə edildi`
    });
    
    return { success: true, userId: data.user_id };
  } catch (error: any) {
    console.error('İstifadəçi yaratma xətası:', error);
    
    toast.error('İstifadəçi yaradıla bilmədi', {
      description: error.message || 'Bilinməyən xəta'
    });
    
    return { success: false, error };
  }
};
