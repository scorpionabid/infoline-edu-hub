// Just updating the necessary lines for region_id vs regionId issues
// Add this import if needed and fix the regionId issues

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { mapToMockSchool } from './schoolTypeConverters';
import { SchoolFormData } from '@/types/school-form';
import { School as SupabaseSchool } from '@/types/supabase';
import { useAuth } from '@/context/auth';
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

interface UseSchoolFormHandlerReturn {
  formData: SchoolFormData;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  setFormDataFromSchool: (school: SupabaseSchool) => void;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  resetForm: () => void;
  validateForm: () => boolean;
}

export const useSchoolFormHandler = (initialSchool = null) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<SchoolFormData>(getInitialFormState());
  const [currentTab, setCurrentTab] = useState('school');

  // Avtomatik olaraq istifadəçinin regionunu təyin et
  useEffect(() => {
    if (user && user.regionId) {
      setFormData(prev => ({ ...prev, regionId: user.regionId }));
    }
  }, [user]);

  const handleFormChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Sektor seçildikdə avtomatik olaraq region də təyin edilsin
    if (name === 'sectorId' && value) {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('region_id')
          .eq('id', value)
          .single();
        
        if (error) throw error;
        
        if (data && data.region_id) {
          setFormData(prev => ({ ...prev, regionId: data.region_id }));
        }
      } catch (error) {
        console.error('Sektor məlumatlarını əldə edərkən xəta:', error);
      }
    }
  };

  const setFormDataFromSchool = (school: SupabaseSchool) => {
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
  };

  const resetForm = () => {
    const initialState = getInitialFormState();
    // İstifadəçinin regionunu saxla
    if (user && user.regionId) {
      initialState.regionId = user.regionId;
    }
    setFormData(initialState);
    setCurrentTab('school');
  };

  const validateForm = () => {
    if (!formData.name || !formData.sectorId) {
      toast.error('Zəruri sahələri doldurun: Məktəb adı və Sektor');
      return false;
    }
    
    if (currentTab === 'admin' && formData.adminEmail && (!formData.adminFullName || !formData.adminPassword)) {
      toast.error('Admin e-poçtu daxil edildiyi halda, Admin adı və şifrəsi də doldurulmalıdır');
      return false;
    }
    
    return true;
  };

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

export default useSchoolFormHandler;
