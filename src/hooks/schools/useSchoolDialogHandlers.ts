import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';

// Define the schema for school form validation
const schoolSchema = z.object({
  name: z.string().min(2, { message: 'School name is required' }),
  code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  region_id: z.string().uuid(),
  sector_id: z.string().uuid(),
  admin_id: z.string().uuid().optional().nullable(),
  admin_email: z.string().email().optional().nullable(),
});

export type SchoolFormValues = z.infer<typeof schoolSchema>;

export const useSchoolDialogHandlers = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { hasRoleAtLeast } = usePermissions();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<any>(null);
  
  // Initialize form with default values
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      status: 'active',
      region_id: user?.region_id || '',
      sector_id: user?.sector_id || '',
      admin_id: null,
      admin_email: null,
    },
  });
  
  // Open dialog for creating a new school
  const openCreateDialog = () => {
    form.reset({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      status: 'active',
      region_id: user?.region_id || '',
      sector_id: user?.sector_id || '',
      admin_id: null,
      admin_email: null,
    });
    setCurrentSchool(null);
    setIsOpen(true);
  };
  
  // Open dialog for editing an existing school
  const openEditDialog = (school: any) => {
    form.reset({
      name: school.name || '',
      code: school.code || '',
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      website: school.website || '',
      description: school.description || '',
      status: school.status || 'active',
      region_id: school.region_id || user?.region_id || '',
      sector_id: school.sector_id || user?.sector_id || '',
      admin_id: school.admin_id || null,
      admin_email: school.admin_email || null,
    });
    setCurrentSchool(school);
    setIsOpen(true);
  };
  
  // Close the dialog
  const closeDialog = () => {
    setIsOpen(false);
    setTimeout(() => {
      form.reset();
      setCurrentSchool(null);
    }, 300);
  };
  
  // Handle form submission
  const onSubmit = async (data: SchoolFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Prepare the data for submission
      const schoolData = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      let result;
      
      if (currentSchool) {
        // Update existing school
        const { data: updatedSchool, error } = await supabase
          .from('schools')
          .update(schoolData)
          .eq('id', currentSchool.id)
          .select()
          .single();
          
        if (error) throw error;
        result = updatedSchool;
        
        toast(t('schoolUpdated'), {
          description: t('schoolUpdatedDesc', { name: data.name }),
        });
      } else {
        // Create new school with required name field
        const { data: newSchool, error } = await supabase
          .from('schools')
          .insert({
            name: data.name, // Explicitly include required name field
            region_id: data.region_id,
            sector_id: data.sector_id,
            code: data.code || null,
            address: data.address || null,
            phone: data.phone || null,
            email: data.email || null,
            website: data.website || null,
            description: data.description || null,
            status: data.status || 'active',
            admin_id: data.admin_id || null,
            admin_email: data.admin_email || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
          
        if (error) throw error;
        result = newSchool;
        
        toast(t('schoolCreated'), {
          description: t('schoolCreatedDesc', { name: data.name }),
        });
      }
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      
      // If admin email was provided, assign admin role
      if (data.admin_email && hasRoleAtLeast('regionadmin')) {
        try {
          const { error: adminError } = await supabase.rpc('assign_school_admin', {
            p_email: data.admin_email,
            p_school_id: result.id,
            p_region_id: data.region_id,
            p_sector_id: data.sector_id
          });
          
          if (adminError) {
            console.error('Error assigning school admin:', adminError);
            toast(t('adminAssignmentFailed'), {
              description: adminError.message,
              variant: 'destructive',
            });
          } else {
            toast(t('adminAssigned'), {
              description: t('adminAssignedDesc', { email: data.admin_email }),
            });
          }
        } catch (adminAssignError) {
          console.error('Error in admin assignment:', adminAssignError);
        }
      }
      
      closeDialog();
    } catch (error: any) {
      console.error('Error submitting school form:', error);
      toast(t('errorOccurred'), {
        description: error.message || t('schoolSubmitError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a school
  const deleteSchool = async (schoolId: string, schoolName: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);
        
      if (error) throw error;
      
      toast(t('schoolDeleted'), {
        description: t('schoolDeletedDesc', { name: schoolName }),
      });
      
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    } catch (error: any) {
      console.error('Error deleting school:', error);
      toast(t('errorOccurred'), {
        description: error.message || t('schoolDeleteError'),
        variant: 'destructive',
      });
    }
  };
  
  return {
    form,
    isOpen,
    isSubmitting,
    currentSchool,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    onSubmit,
    deleteSchool,
  };
};

export default useSchoolDialogHandlers;
