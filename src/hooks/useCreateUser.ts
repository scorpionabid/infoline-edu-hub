
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { UserFormData } from '@/types/user';

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const createUser = useCallback(async (userData: UserFormData) => {
    if (!userData.name || !userData.email || !userData.password) {
      toast.error(t('requiredFieldsMissing') || 'Zəhmət olmasa bütün vacib sahələri doldurun');
      return { success: false, error: 'Məlumatlar natamamdır' };
    }
    
    setLoading(true);
    
    try {
      console.log('İstifadəçi yaratma başladı:', {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        hasPassword: !!userData.password
      });
      
      // Supabase-də yeni istifadəçi yaratmaq
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          userData: {
            full_name: userData.name,
            role: userData.role,
            region_id: userData.regionId || null,
            sector_id: userData.sectorId || null,
            school_id: userData.schoolId || null,
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
      
      if (data && data.error) {
        console.error('İstifadəçi yaratma xətası:', data.error);
        throw new Error(data.error);
      }
      
      console.log('İstifadəçi uğurla yaradıldı:', data);
      
      // Uğurlu mesaj
      toast.success(t('userCreated') || 'İstifadəçi uğurla yaradıldı', {
        description: t('userCreatedDesc') || `${userData.email} e-poçt ünvanı ilə istifadəçi yaradıldı`
      });
      
      return { success: true, data };
    } catch (error: any) {
      console.error('İstifadəçi yaratma xətası:', error);
      
      let errorMessage = t('errorCreatingUser') || 'İstifadəçi yaradılarkən xəta baş verdi';
      
      // Specific error messages
      if (error.message) {
        if (error.message.includes('already exists') || error.message.includes('already registered')) {
          errorMessage = t('userAlreadyExists') || 'Bu e-poçt ünvanı ilə istifadəçi artıq mövcuddur';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(t('errorOccurred') || 'Xəta baş verdi', {
        description: errorMessage
      });
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  return {
    createUser,
    loading
  };
};
