
import { useState, useCallback, useEffect } from 'react';
import { School } from '@/types/school';
import { toast } from 'sonner';
import { useSchoolsData } from './useSchoolsData';

// Real school form data interface
export interface SchoolFormData {
  name: string;
  principalName: string;
  address: string;
  regionId: string;
  sectorId: string;
  phone: string;
  email: string;
  studentCount: string;
  teacherCount: string;
  status: 'active' | 'inactive';
  type: string;
  language: string;
  adminEmail: string;
  adminFullName: string;
  adminPassword: string;
  adminStatus: 'active' | 'inactive';
}

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
  regions: any[];
  sectors: any[];
  setCurrentTab: (tab: string) => void;
  setFormDataFromSchool: (school: School) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

export const useSchoolForm = (): UseSchoolFormReturn => {
  const [formData, setFormData] = useState<SchoolFormData>(getInitialFormState());
  const [currentTab, setCurrentTab] = useState('school');
  
  // Use real data instead of mock
  const { regions, sectors } = useSchoolsData();

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
      principalName: school.principal_name || '',
      address: school.address || '',
      regionId: school.region_id,
      sectorId: school.sector_id,
      phone: school.phone || '',
      email: school.email || '',
      studentCount: school.student_count?.toString() || '',
      teacherCount: school.teacher_count?.toString() || '',
      status: (school.status === 'active' || school.status === 'inactive') ? school.status as 'active' | 'inactive' : 'active',
      type: school.type || 'full_secondary',
      language: school.language || 'az',
      adminEmail: school.admin_email || '',
      adminFullName: '',
      adminPassword: '',
      adminStatus: 'active' as 'active' | 'inactive'
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

  useEffect(() => {
    return () => {
      setFormData(getInitialFormState());
      setCurrentTab('school');
    };
  }, []);

  return {
    formData,
    currentTab,
    regions,
    sectors,
    setCurrentTab,
    setFormDataFromSchool,
    handleFormChange,
    resetForm,
    validateForm
  };
};

export default useSchoolForm;
