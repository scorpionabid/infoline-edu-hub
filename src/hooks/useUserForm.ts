
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserFormData } from '@/types/user';
import { toast } from 'sonner';

export const useUserForm = (onSubmit: (data: UserFormData) => Promise<boolean>, initialData?: Partial<UserFormData>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<UserFormData> = {
    full_name: '',
    email: '',
    phone: '',
    position: '',
    role: 'user',
    regionId: undefined,
    sectorId: undefined,
    schoolId: undefined,
    status: 'active',
    language: 'az',
    password: '',
    notificationSettings: {
      email: true,
      push: false,
      sms: false
    },
    ...initialData
  };
  
  const form = useForm<UserFormData>({
    defaultValues
  });
  
  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      // Şifrə tipini yoxla
      if (data.password === '') {
        delete data.password;
      }
      
      // Rol dəyərləri
      if (data.role === 'schooladmin' && !data.schoolId) {
        toast.error('Məktəb admin üçün məktəb seçilməlidir');
        return;
      }
      
      if (data.role === 'sectoradmin' && !data.sectorId) {
        toast.error('Sektor admin üçün sektor seçilməlidir');
        return;
      }
      
      if (data.role === 'regionadmin' && !data.regionId) {
        toast.error('Region admin üçün region seçilməlidir');
        return;
      }
      
      const success = await onSubmit(data);
      
      if (success) {
        form.reset(defaultValues);
      }
    } catch (error: any) {
      console.error('Form submit xətası:', error);
      toast.error(`Xəta: ${error.message || 'Bilinməyən xəta'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
    reset: () => form.reset(defaultValues)
  };
};
