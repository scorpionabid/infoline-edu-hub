
import { useState, useCallback, useEffect } from 'react';
import { SchoolFormData } from '@/types/school-form';
import { toast } from 'sonner';
import { School as SupabaseSchool } from '@/types/supabase';
import { mapToMockSchool } from './schoolTypeConverters';
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

  const handleFormChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Sektor seçiləndə, onun region ID-sini təyin et
    if (name === 'sectorId' && value) {
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('region_id')
          .eq('id', value)
          .single();
        
        if (error) {
          console.error('Sektor məlumatı alınarkən xəta:', error);
          return;
        }
        
        if (data && data.region_id) {
          setFormData(prev => ({
            ...prev,
            [name]: value,
            regionId: data.region_id
          }));
          return;
        }
      } catch (err) {
        console.error('Sektor sorğusu zamanı xəta:', err);
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    if (currentTab === 'admin' && formData.adminEmail) {
      // Admin e-poçtu daxil edilmişsə, admin adı da tələb olunur
      if (!formData.adminFullName) {
        toast.error('Admin e-poçtu daxil edildiyi halda, Admin adı da doldurulmalıdır');
        return false;
      }
      
      // Yeni istifadəçi yaradılırsa, şifrə də tələb olunur
      if (!formData.adminPassword) {
        toast.error('Yeni admin yaradılarkən şifrə də daxil edilməlidir');
        return false;
      }
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
