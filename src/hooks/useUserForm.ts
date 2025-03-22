
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserFormData } from '@/types/user';
import { Role } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect } from 'react';

interface UseUserFormProps {
  initialData: UserFormData;
  onFormChange: (data: UserFormData) => void;
  passwordRequired?: boolean;
}

export const useUserForm = ({ initialData, onFormChange, passwordRequired = false }: UseUserFormProps) => {
  const { t } = useLanguage();
  
  // Form validation schema
  const formSchema = z.object({
    name: z.string().min(1, { message: t('nameRequired') }),
    email: z.string().email({ message: t('invalidEmail') }),
    password: passwordRequired
      ? z.string().min(6, { message: t('passwordTooShort') })
      : z.string().optional(),
    role: z.enum(['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'] as [Role, ...Role[]]),
    status: z.enum(['active', 'inactive', 'blocked']),
    regionId: z.string().optional(),
    sectorId: z.string().optional(),
    schoolId: z.string().optional(),
    language: z.string().optional(),
    twoFactorEnabled: z.boolean().optional(),
    notificationSettings: z.object({
      email: z.boolean(),
      system: z.boolean(),
    }).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      password: initialData.password || '',
      role: initialData.role,
      status: initialData.status,
      regionId: initialData.regionId,
      sectorId: initialData.sectorId,
      schoolId: initialData.schoolId,
      language: initialData.language,
      twoFactorEnabled: initialData.twoFactorEnabled,
      notificationSettings: initialData.notificationSettings,
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    form.reset({
      name: initialData.name,
      email: initialData.email,
      password: initialData.password || '',
      role: initialData.role,
      status: initialData.status,
      regionId: initialData.regionId,
      sectorId: initialData.sectorId,
      schoolId: initialData.schoolId,
      language: initialData.language,
      twoFactorEnabled: initialData.twoFactorEnabled,
      notificationSettings: initialData.notificationSettings,
    });
  }, [initialData, form]);

  // Update parent component when form values change
  const handleFieldChange = (fieldName: string, value: any) => {
    const newData = { ...initialData, [fieldName]: value };
    
    // Reset dependent fields when region/sector changes
    if (fieldName === 'regionId') {
      newData.sectorId = undefined;
      newData.schoolId = undefined;
    } else if (fieldName === 'sectorId') {
      newData.schoolId = undefined;
    } else if (fieldName === 'role') {
      // Reset region/sector/school based on role
      if (value === 'superadmin') {
        newData.regionId = undefined;
        newData.sectorId = undefined;
        newData.schoolId = undefined;
      } else if (value === 'regionadmin') {
        newData.sectorId = undefined;
        newData.schoolId = undefined;
      } else if (value === 'sectoradmin') {
        newData.schoolId = undefined;
      }
    }
    
    onFormChange(newData);
  };

  return {
    form,
    handleFieldChange,
  };
};
