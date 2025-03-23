
import { useState, useCallback } from 'react';
import { School, SchoolFormData, mockRegions, mockSectors } from '@/data/schoolsData';
import { toast } from 'sonner';

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
    setFormData({
      name: school.name,
      principalName: school.principalName,
      address: school.address,
      regionId: school.regionId,
      sectorId: school.sectorId,
      phone: school.phone,
      email: school.email,
      studentCount: school.studentCount.toString(),
      teacherCount: school.teacherCount.toString(),
      status: school.status,
      type: school.type,
      language: school.language,
      adminEmail: school.adminEmail || '',
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
