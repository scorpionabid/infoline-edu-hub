
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School, adaptSchoolToSupabase } from '@/types/supabase';
import { SchoolFormData } from '@/types/school-form';
import { toast } from 'sonner';

interface UseSchoolsOperationsReturn {
  isLoading: boolean;
  error: string | null;
  addSchool: (formData: SchoolFormData) => Promise<void>;
  updateSchool: (id: string, formData: SchoolFormData) => Promise<void>;
  deleteSchool: (id: string) => Promise<void>;
  assignSchoolAdmin: (schoolId: string, adminData: any) => Promise<void>;
  resetSchoolAdminPassword: (userId: string, newPassword: string) => Promise<void>;
}

export const useSchoolsOperations = (): UseSchoolsOperationsReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Yeni məktəb əlavə et
   */
  const addSchool = async (formData: SchoolFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Məktəb məlumatlarını hazırla
      const schoolData = {
        name: formData.name,
        principal_name: formData.principalName,
        region_id: formData.regionId,
        sector_id: formData.sectorId,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        student_count: parseInt(formData.studentCount) || 0,
        teacher_count: parseInt(formData.teacherCount) || 0,
        status: formData.status as 'active' | 'inactive', // status tipini spesifikləşdir
        type: formData.type,
        language: formData.language,
        admin_email: formData.adminEmail
      };
      
      // Məktəbi Supabase-ə əlavə et
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert([schoolData])
        .select()
        .single();
      
      if (schoolError) throw schoolError;
      
      // Admin məlumatları varsa, istifadəçi yarat
      if (formData.adminEmail && formData.adminFullName && formData.adminPassword) {
        // Admin istifadəçisini yarat
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
          email: formData.adminEmail,
          password: formData.adminPassword,
          email_confirm: true,
          user_metadata: {
            full_name: formData.adminFullName,
            role: 'schooladmin',
            region_id: formData.regionId,
            sector_id: formData.sectorId,
            school_id: schoolData.id
          }
        });
        
        if (userError) {
          console.error('Admin yaradılarkən xəta:', userError);
          toast.error(`Admin yaradılarkən xəta: ${userError.message}`);
        } else {
          // Uğurlu admin yaradılması
          toast.success('Məktəb admin ilə birlikdə uğurla yaradıldı');
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Məktəb əlavə edilərkən xəta:', error);
      setError(error instanceof Error ? error.message : 'Bilinməyən xəta');
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Mövcud məktəbi yenilə
   */
  const updateSchool = async (id: string, formData: SchoolFormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Məktəb məlumatlarını hazırla
      const schoolData = {
        name: formData.name,
        principal_name: formData.principalName,
        region_id: formData.regionId,
        sector_id: formData.sectorId,
        address: formData.address,
        email: formData.email,
        phone: formData.phone,
        student_count: parseInt(formData.studentCount) || 0,
        teacher_count: parseInt(formData.teacherCount) || 0,
        status: formData.status as 'active' | 'inactive', // status tipini spesifikləşdir
        type: formData.type,
        language: formData.language,
        admin_email: formData.adminEmail
      };
      
      // Məktəbi Supabase-də yenilə
      const { error: updateError } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Admin məlumatları varsa, istifadəçini yenilə
      if (formData.adminEmail && formData.adminFullName) {
        // TODO: Admin məlumatlarını yenilə
        // Burada backend funksiyası və ya direkt auth API ilə işləmək lazımdır
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Məktəb yenilənərkən xəta:', error);
      setError(error instanceof Error ? error.message : 'Bilinməyən xəta');
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Məktəbi sil
   */
  const deleteSchool = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Məktəbi Supabase-dən sil
      const { error: deleteError } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      setIsLoading(false);
    } catch (error) {
      console.error('Məktəb silinərkən xəta:', error);
      setError(error instanceof Error ? error.message : 'Bilinməyən xəta');
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Məktəbə admin təyin et
   */
  const assignSchoolAdmin = async (schoolId: string, adminData: any): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (adminData.adminType === 'existing') {
        // Mövcud istifadəçini admin kimi təyin et
        const { error: roleError } = await supabase.functions.invoke('assign-school-admin', {
          body: { userId: adminData.userId, schoolId }
        });
        
        if (roleError) throw roleError;
      } else {
        // Yeni admin yarat
        const { error: createError } = await supabase.functions.invoke('create-school-admin', {
          body: {
            fullName: adminData.fullName,
            email: adminData.email,
            password: adminData.password,
            schoolId
          }
        });
        
        if (createError) throw createError;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Məktəb admin təyin edilərkən xəta:', error);
      setError(error instanceof Error ? error.message : 'Bilinməyən xəta');
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Admin şifrəsini sıfırla
   */
  const resetSchoolAdminPassword = async (userId: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Supabase Admin API istifadə edərək şifrəni yenilə
      const { error: resetError } = await supabase.functions.invoke('reset-user-password', {
        body: { userId, newPassword }
      });
      
      if (resetError) throw resetError;
      
      setIsLoading(false);
    } catch (error) {
      console.error('Şifrə sıfırlanarkən xəta:', error);
      setError(error instanceof Error ? error.message : 'Bilinməyən xəta');
      setIsLoading(false);
      throw error;
    }
  };

  return {
    isLoading,
    error,
    addSchool,
    updateSchool,
    deleteSchool,
    assignSchoolAdmin,
    resetSchoolAdminPassword
  };
};
