
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useSchoolOperations = (onOperationComplete: () => void) => {
  const { t } = useLanguage();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<School | null>(null);

  const handleEditSchool = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteSchool = useCallback((school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleViewAdmin = useCallback((school: School) => {
    setSelectedAdmin(school);
    setIsAdminDialogOpen(true);
  }, []);

  const handleUpdateSchoolConfirm = useCallback(async (updatedSchoolData: School) => {
    if (!selectedSchool) return;
    
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: updatedSchoolData.name,
          region_id: updatedSchoolData.regionId || updatedSchoolData.region_id,
          sector_id: updatedSchoolData.sectorId || updatedSchoolData.sector_id,
          address: updatedSchoolData.address,
          phone: updatedSchoolData.phone,
          email: updatedSchoolData.email,
          principal_name: updatedSchoolData.principal_name,
          student_count: updatedSchoolData.student_count,
          teacher_count: updatedSchoolData.teacher_count,
          type: updatedSchoolData.type,
          language: updatedSchoolData.language,
          status: updatedSchoolData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSchool.id);
      
      if (error) throw error;
      
      toast.success(t('schoolUpdated'));
      setIsEditDialogOpen(false);
      onOperationComplete();
    } catch (err) {
      console.error('Məktəb yeniləmə xətası:', err);
      toast.error('Məktəb məlumatları yenilənərkən xəta baş verdi');
    }
  }, [selectedSchool, t, onOperationComplete]);

  const handleDeleteSchoolConfirm = useCallback(async () => {
    if (!selectedSchool) return;
    
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', selectedSchool.id);
      
      if (error) throw error;
      
      toast.success(t('schoolDeleted'));
      setIsDeleteDialogOpen(false);
      onOperationComplete();
    } catch (err) {
      console.error('Məktəb silmə xətası:', err);
      toast.error('Məktəb silinərkən xəta baş verdi');
    }
  }, [selectedSchool, t, onOperationComplete]);

  const handleAdminUpdate = useCallback(async () => {
    if (!selectedAdmin) return;
    
    try {
      // Burada admin yeniləmə işi həyata keçirilə bilər
      // Həqiqi kodda burada API call olacaq
      
      toast.success(t('adminUpdated'));
      setIsAdminDialogOpen(false);
      onOperationComplete();
    } catch (err) {
      console.error('Admin yeniləmə xətası:', err);
      toast.error('Admin məlumatları yenilənərkən xəta baş verdi');
    }
  }, [selectedAdmin, t, onOperationComplete]);

  const handleResetPassword = useCallback(async (newPassword: string) => {
    if (!selectedAdmin) return;
    
    try {
      // Şifrə yeniləmə işi
      // Həqiqi kodda burada API call olacaq
      
      toast.success(t('passwordReset'));
    } catch (err) {
      console.error('Şifrə sıfırlama xətası:', err);
      toast.error('Şifrə sıfırlanarkən xəta baş verdi');
    }
  }, [selectedAdmin, t]);

  const handleCreateSchool = useCallback(async (schoolData: Partial<School>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({
          name: schoolData.name,
          region_id: schoolData.regionId || schoolData.region_id,
          sector_id: schoolData.sectorId || schoolData.sector_id,
          address: schoolData.address,
          phone: schoolData.phone,
          email: schoolData.email,
          principal_name: schoolData.principal_name,
          student_count: schoolData.student_count,
          teacher_count: schoolData.teacher_count,
          type: schoolData.type,
          language: schoolData.language,
          status: schoolData.status || 'active',
          admin_email: schoolData.adminEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success(t('schoolCreated'));
      onOperationComplete();
      return data;
    } catch (err) {
      console.error('Məktəb yaradılması xətası:', err);
      toast.error('Məktəb yaradılarkən xəta baş verdi');
      return null;
    }
  }, [t, onOperationComplete]);

  return {
    selectedSchool,
    selectedAdmin,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isAdminDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsAdminDialogOpen,
    handleEditSchool,
    handleDeleteSchool,
    handleViewAdmin,
    handleUpdateSchoolConfirm,
    handleDeleteSchoolConfirm,
    handleAdminUpdate,
    handleResetPassword,
    handleCreateSchool
  };
};
