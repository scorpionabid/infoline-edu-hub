
import { useState, useCallback, useEffect } from 'react';
import { SchoolFormData } from '@/types/school-form';
import { toast } from 'sonner';
import { School as SupabaseSchool } from '@/types/supabase';
import { mapToMockSchool } from './schools/schoolTypeConverters';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Initial form data
export const getInitialFormState = (): SchoolFormData => ({
  name: '',
  principalName: '',
  address: '',
  regionId: '',
  sectorId: '',
  phone: '',
  email: '',
  studentCount: '',
  teacherCount: '',
  status: 'active',
  type: 'full_secondary',
  language: 'az',
  adminEmail: '',
  adminFullName: '',
  adminPassword: '',
  adminStatus: 'active'
});

interface UseSchoolFormReturn {
  formData: SchoolFormData;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setFormDataFromSchool: (school: School) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

export const useSchoolForm = (): UseSchoolFormReturn => {
  const [formData, setFormData] = useState<SchoolFormData>(getInitialFormState());
  const [currentTab, setCurrentTab] = useState('school');

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'regionId') {
      setFormData(prev => ({ ...prev, sectorId: '' }));
    }
  }, []);

  const setFormDataFromSchool = useCallback((school: School) => {
    const newFormData = {
      name: school.name,
      principalName: school.principalName || '',
      address: school.address || '',
      regionId: school.regionId,
      sectorId: school.sectorId,
      phone: school.phone || '',
      email: school.email || '',
      studentCount: school.studentCount?.toString() || '',
      teacherCount: school.teacherCount?.toString() || '',
      status: school.status || 'active',
      type: school.type || 'full_secondary',
      language: school.language || 'az',
      adminEmail: school.adminEmail || '',
      adminFullName: '',
      adminPassword: '',
      adminStatus: 'active'
    };
    
    setFormData(newFormData);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(getInitialFormState());
    setCurrentTab('school');
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name || !formData.regionId || !formData.sectorId) {
      toast.error('Zəruri sahələri doldurun: Məktəb adı, Region və Sektor');
      return false;
    }
    
    if (currentTab === 'admin' && (!formData.adminEmail || !formData.adminFullName || !formData.adminPassword)) {
      toast.error('Zəruri admin məlumatlarını doldurun: Ad Soyad, Email və Parol');
      return false;
    }
    
    return true;
  }, [formData, currentTab]);

  // Component unmount olduqdan sonra formanı sıfırla
  useEffect(() => {
    return () => {
      setFormData(getInitialFormState());
      setCurrentTab('school');
    };
  }, []);

  return {
    formData,
    currentTab,
    setCurrentTab,
    setFormDataFromSchool,
    handleFormChange,
    resetForm,
    validateForm
  };
};
