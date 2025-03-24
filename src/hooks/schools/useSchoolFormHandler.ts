
import { useState, useCallback } from 'react';
import { SchoolFormData } from '@/types/school-form';
import { toast } from 'sonner';
import { School as SupabaseSchool } from '@/types/supabase';
import { mapToMockSchool } from './schoolTypeConverters';

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

interface UseSchoolFormHandlerReturn {
  formData: SchoolFormData;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setFormDataFromSchool: (school: SupabaseSchool) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

export const useSchoolFormHandler = (): UseSchoolFormHandlerReturn => {
  const [formData, setFormData] = useState<SchoolFormData>(getInitialFormState());
  const [currentTab, setCurrentTab] = useState('school');

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'regionId') {
      setFormData(prev => ({ ...prev, sectorId: '' }));
    }
  }, []);

  const setFormDataFromSchool = useCallback((school: SupabaseSchool) => {
    const mappedSchool = mapToMockSchool(school);
    
    setFormData({
      name: mappedSchool.name,
      principalName: mappedSchool.principalName || '',
      address: mappedSchool.address || '',
      regionId: mappedSchool.regionId,
      sectorId: mappedSchool.sectorId,
      phone: mappedSchool.phone || '',
      email: mappedSchool.email || '',
      studentCount: mappedSchool.studentCount?.toString() || '',
      teacherCount: mappedSchool.teacherCount?.toString() || '',
      status: mappedSchool.status || 'active',
      type: mappedSchool.type || 'full_secondary',
      language: mappedSchool.language || 'az',
      adminEmail: mappedSchool.adminEmail || '',
      adminFullName: '',
      adminPassword: '',
      adminStatus: 'active'
    });
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
