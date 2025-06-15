
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { UserFormData } from '@/types/user';

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);

  const createUser = useCallback(async (userData: UserFormData) => {
    if (!userData.fullName || !userData.email || !userData.password) {
      toast.error(t('requiredFieldsMissing') || 'Zəhmət olmasa bütün vacib sahələri doldurun');
      return { success: false, error: 'Məlumatlar natamamdır' };
    }
    
    setLoading(true);
    
    try {
      console.log('İstifadəçi yaratma başladı:', {
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        hasPassword: !!userData.password
      });
      
      // Supabase-də yeni istifadəçi yaratmaq
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          userData: {
            full_name: userData.fullName,
            role: userData.role,
            region_id: userData.region_id || null,
            sector_id: userData.sector_id || null,
            school_id: userData.school_id || null,
            phone: userData.phone || null,
            position: userData.position || null,
            language: userData.language || 'az',
            status: userData.status || 'active'
          }
        }
      });
      
      if (error) {
        console.error('Edge funksiya xətası:', error);
        throw new Error(error.message || 'İstifadəçi yaradılarkən xəta baş verdi');
      }
      
      if (!data || !data.success) {
        console.error('İstifadəçi yaratma cavabı:', data);
        throw new Error((data && data.error) || 'İstifadəçi yaradılarkən bilinməyən xəta baş verdi');
      }
      
      console.log('İstifadəçi yaradıldı:', data);
      
      toast.success(t('userCreatedSuccessfully') || 'İstifadəçi uğurla yaradıldı');
      
      return {
        success: true,
        user: data.user
      };
    } catch (error: any) {
      console.error('İstifadəçi yaratma xətası:', error);
      
      let errorMessage = error.message || t('errorCreatingUser') || 'İstifadəçi yaradılarkən xəta baş verdi';
      
      // Xüsusi xəta halları üçün mesajları dəyişək
      if (errorMessage.includes('already exists')) {
        errorMessage = t('userAlreadyExists') || 'Bu email ünvanı ilə istifadəçi artıq mövcuddur';
      }
      
      toast.error(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  return {
    loading,
    createUser
  };
};

export default useCreateUser;
