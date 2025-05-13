
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { School, SchoolFormData } from '@/types/ui';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';

// Form validation schema
const schoolFormSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  region_id: z.string().min(1, 'Region is required'),
  sector_id: z.string().min(1, 'Sector is required'),
  status: z.string().optional(),
  principal_name: z.string().optional(),
  logo: z.string().optional().nullable(),
  id: z.string().optional()
});

export const useSchoolFormHandler = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<string>('general');
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    region_id: '',
    sector_id: '',
    status: 'active',
    principal_name: '',
    logo: null
  });
  
  // Form setup with react-hook-form
  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: formData
  });

  // Function to set form data from a School object
  const setFormDataFromSchool = (school: School | null) => {
    if (!school) return;
    
    const newFormData = {
      id: school.id,
      name: school.name,
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      region_id: school.region_id,
      sector_id: school.sector_id,
      status: school.status || 'active',
      principal_name: school.principal_name || '',
      logo: school.logo
    };
    
    setFormData(newFormData);
    form.reset(newFormData);
  };

  // Handle form field changes
  const handleFormChange = (field: keyof SchoolFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    form.setValue(field, value);
  };

  // Reset form to empty state
  const resetForm = () => {
    const emptyForm = {
      name: '',
      address: '',
      phone: '',
      email: '',
      region_id: '',
      sector_id: '',
      status: 'active',
      principal_name: '',
      logo: null
    };
    setFormData(emptyForm);
    form.reset(emptyForm);
    setCurrentTab('general');
  };

  // Validate form data
  const validateForm = () => {
    const isValid = form.trigger();
    if (!isValid) {
      toast.error(t('validationError'), {
        description: t('pleaseCheckFormErrors')
      });
    }
    return isValid;
  };

  return {
    form,
    formData,
    currentTab,
    setCurrentTab,
    setFormDataFromSchool,
    handleFormChange,
    resetForm,
    validateForm,
    handleSubmit: form.handleSubmit,
    isSubmitting: form.formState.isSubmitting,
    handleCancel: () => resetForm(),
    isDirty: form.formState.isDirty,
    errors: form.formState.errors
  };
};

export default useSchoolFormHandler;
