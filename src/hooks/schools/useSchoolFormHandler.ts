
import { useState, useCallback, useEffect } from 'react';
import { SchoolFormData } from '@/types/school-form';
import { toast } from 'sonner';
import { School as SupabaseSchool } from '@/types/supabase';
import { mapToMockSchool } from './schoolTypeConverters';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [formData, setFormData] = useState<SchoolFormData>(getInitialFormState());
  const [currentTab, setCurrentTab] = useState('school');

  // Avtomatik olaraq istifadəçinin regionunu təyin et
  useEffect(() => {
    if (user && user.regionId) {
      setFormData(prev => ({ ...prev, regionId: user.regionId }));
    }
  }, [user]);

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
    const initialState = getInitialFormState();
    // İstifadəçinin regionunu saxla
    if (user && user.regionId) {
      initialState.regionId = user.regionId;
    }
    setFormData(initialState);
    setCurrentTab('school');
  }, [user]);

  const validateForm = useCallback(() => {
    if (!formData.name || !formData.sectorId) {
      toast.error('Zəruri sahələri doldurun: Məktəb adı və Sektor');
      return false;
    }
    
    if (currentTab === 'admin' && formData.adminEmail && (!formData.adminFullName || !formData.adminPassword)) {
      toast.error('Admin e-poçtu daxil edildiyi halda, Admin adı və şifrəsi də doldurulmalıdır');
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
