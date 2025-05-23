import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FullUserData } from '@/types/user';
import { toast } from 'sonner';

/**
 * İstifadəçi seçimləri ilə əlaqəli funksiyalar
 * 
 * Bu modul istifadəçi seçimlərini (preferences) idarə etmək üçün 
 * funksiyalar təqdim edir.
 */

/**
 * İstifadəçi seçimlərini yeniləmək üçün hook
 * 
 * @param user Cari istifadəçi
 * @param setUser İstifadəçi state-ni yeniləmək üçün setter funksiyası
 */
export const useUserPreferences = (
  user: FullUserData | null,
  setUser: (user: FullUserData | null) => void
) => {
  /**
   * İstifadəçi seçimlərini yenilə
   * 
   * @param preferences Yeni seçim dəyərləri
   */
  const updateUserPreferences = useCallback(async (preferences: any): Promise<void> => {
    if (!user) return;
    
    try {
      // @ts-ignore - FullUserData tipinde preferences olmaya bilər, amma genişlənmiş tipi istifadə edirik
      const updatedUser = {
        ...user,
        // @ts-ignore - İstifadə kontekstində buna icazə verilir
        preferences: {
          // @ts-ignore - İstifadə kontekstində buna icazə verilir
          ...(user.preferences || {}),
          ...preferences
        }
      } as FullUserData;
      
      // Update user in state
      setUser(updatedUser);
      
      // Update user in backend if needed - məlumat bazasına uyğun metod seçilir
      try {
        // Əvvəlcə mövcud profil məlumatlarını əldə edirik
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          // Profildə metadata sahəsi varsa, onu istifadə edirik
          if ('metadata' in profile) {
            const currentMetadata = profile.metadata ? 
              (typeof profile.metadata === 'string' ? JSON.parse(profile.metadata) : profile.metadata) : {};
              
            // Preferences məlumatlarını metadata içərisində saxlayırıq
            // TypeScript-dən keçmək üçün as any istədik
            await supabase
              .from('profiles')
              .update({
                metadata: {
                  ...currentMetadata,
                  preferences: updatedUser.preferences
                }
              } as any)
              .eq('id', user.id);
          } 
          // Profildə preferences sahəsi varsa, birbaşa onu yeniləyirik
          else if ('preferences' in profile) {
            // TypeScript-dən keçmək üçün as any istədik
            await supabase
              .from('profiles')
              .update({
                preferences: JSON.stringify(updatedUser.preferences)
              } as any)
              .eq('id', user.id);
          }
          // Digər halda, metadata_json sahəsini istifadə etməyə çalışırıq
          else if ('metadata_json' in profile) {
            const currentMetadata = profile.metadata_json ? 
              (typeof profile.metadata_json === 'string' ? JSON.parse(profile.metadata_json) : profile.metadata_json) : {};
              
            // TypeScript-dən keçmək üçün as any istədik
            await supabase
              .from('profiles')
              .update({
                metadata_json: {
                  ...currentMetadata,
                  preferences: updatedUser.preferences
                }
              } as any)
              .eq('id', user.id);
          }
          // Heç bir münasib sahə tapmasaq, xidməti loq eliyərək davam edirik
          else {
            console.warn('Profildə preferences saxlamaq üçün uyğun sahə tapılmadı');
            // Local məlumatları geri qaytarırıq, uzaqda saxlanmasa da
          }
        }
      } catch (updateErr) {
        console.error('Profile update error:', updateErr);
      }
    } catch (err: any) {
      console.error('Update preferences xətası:', err);
      toast.error('Preferences update xətası', { description: err.message });
    }
  }, [user, setUser]);

  return {
    updateUserPreferences
  };
};
