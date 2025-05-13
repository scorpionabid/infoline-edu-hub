
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { mapToMockSchool } from './schoolTypeConverters';

const schoolSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  principal_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  region_id: z.string().min(1, { message: 'Region is required' }),
  sector_id: z.string().min(1, { message: 'Sector is required' }),
  status: z.string().optional(),
  student_count: z.number().int().positive().optional(),
  teacher_count: z.number().int().positive().optional(),
  logo: z.string().optional().nullable(),
});

export type SchoolFormValues = z.infer<typeof schoolSchema>;

export const useSchoolFormHandler = (initialData: any, onSubmit: (data: SchoolFormValues) => Promise<void>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);
  
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: initialData || {
      name: '',
      principal_name: '',
      address: '',
      phone: '',
      email: '',
      region_id: user?.region_id || '',
      sector_id: '',
      status: 'active',
      student_count: undefined,
      teacher_count: undefined,
      logo: null,
    },
  });

  // Set region_id based on user's region if creating new school
  useEffect(() => {
    if (!initialData && user && user.region_id) {
      form.setValue('region_id', user.region_id);
    }
  }, [form, initialData, user]);

  const handleSubmit = async (data: SchoolFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert string numbers to actual numbers
      const formattedData = {
        ...data,
        student_count: data.student_count ? Number(data.student_count) : undefined,
        teacher_count: data.teacher_count ? Number(data.teacher_count) : undefined,
      };
      
      await onSubmit(formattedData);
      form.reset();
    } catch (error) {
      console.error('Error submitting school form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
    getValues: form.getValues,
    setValue: form.setValue,
    watch: form.watch,
    reset: form.reset,
    control: form.control,
    formState: form.formState,
  };
};
