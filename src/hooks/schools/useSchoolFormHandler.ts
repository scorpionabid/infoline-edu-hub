
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { schoolFormSchema } from '@/lib/validationSchemas';
import { School, SchoolFormData } from '@/types/ui';
import { useSchoolOperations } from './useSchoolOperations';
import { mapToMockSchool } from './schoolTypeConverters';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

export type SchoolFormMode = 'create' | 'edit';

interface UseSchoolFormHandlerProps {
  onSuccess?: (school: School) => void;
  onCancel?: () => void;
  initialSchool?: School;
  mode: SchoolFormMode;
}

export const useSchoolFormHandler = ({
  onSuccess,
  onCancel,
  initialSchool = mapToMockSchool(),
  mode
}: UseSchoolFormHandlerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const { createSchool, updateSchool } = useSchoolOperations();
  const { user } = useAuthStore();
  
  // Initialize form with initialSchool data or empty values
  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      id: initialSchool?.id || undefined,
      name: initialSchool?.name || '',
      address: initialSchool?.address || '',
      phone: initialSchool?.phone || '',
      email: initialSchool?.email || '',
      principal_name: initialSchool?.principal_name || '',
      region_id: initialSchool?.region_id || user?.region_id || '',
      sector_id: initialSchool?.sector_id || user?.sector_id || '',
      status: initialSchool?.status || 'active',
      logo: initialSchool?.logo || null
    }
  });

  const handleSubmit = async (formData: SchoolFormData) => {
    try {
      setIsSubmitting(true);

      // For school admins, we don't allow changing region or sector
      if (user?.role === 'schooladmin') {
        formData.region_id = user.region_id;
        formData.sector_id = user.sector_id;
      } 
      // For sector admins, we don't allow changing region
      else if (user?.role === 'sectoradmin') {
        formData.region_id = user.region_id;
      }

      // Create or update school based on mode
      const result = mode === 'create' 
        ? await createSchool({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            principal_name: formData.principal_name,
            region_id: formData.region_id,
            sector_id: formData.sector_id,
            status: formData.status,
            logo: formData.logo
          })
        : await updateSchool(formData.id!, {
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            principal_name: formData.principal_name,
            region_id: formData.region_id,
            sector_id: formData.sector_id,
            status: formData.status,
            logo: formData.logo
          });

      if (result) {
        toast.success(
          mode === 'create' ? t('schoolCreated') : t('schoolUpdated'), 
          { description: mode === 'create' ? t('schoolCreatedDesc') : t('schoolUpdatedDesc') }
        );
        if (onSuccess) onSuccess(result);
      }
    } catch (error: any) {
      console.error('School form error:', error);
      toast.error(t('errorOccurred'), { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    if (onCancel) onCancel();
  };

  // Additional helper functions
  const isDirty = form.formState.isDirty;

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
    handleCancel,
    isDirty,
    errors: form.formState.errors
  };
};
