import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { UserFormData } from '@/types/user';

// Validation schema for the user form
const formSchema = (passwordRequired: boolean) => z.object({
  full_name: z.string().min(2, 'Ad soyad minimum 2 simvol olmalıdır'),
  email: z.string().email('Düzgün e-poçt ünvanı daxil edin'),
  phone: z.string().optional(),
  position: z.string().optional(),
  role: z.string().min(1, 'Rol seçilməlidir'),
  regionId: z.string().optional(),
  sectorId: z.string().optional(),
  schoolId: z.string().optional(),
  status: z.string().optional(),
  language: z.string().default('az'),
  password: passwordRequired
    ? z.string().min(6, 'Şifrə minimum 6 simvol olmalıdır')
    : z.string().optional(),
  notificationSettings: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
    system: z.boolean().default(true)
  }).optional()
});

interface UseUserFormProps {
  initialData: UserFormData;
  onFormChange: (data: UserFormData) => void;
  passwordRequired?: boolean;
}

export function useUserForm({ initialData, onFormChange, passwordRequired = false }: UseUserFormProps) {
  const [formState, setFormState] = useState<UserFormData>(initialData);
  
  // Create form with react-hook-form and zod validation
  const form = useForm<UserFormData>({
    resolver: zodResolver(formSchema(passwordRequired)),
    defaultValues: initialData,
    mode: 'onChange'
  });
  
  // Handle individual field changes
  const handleFieldChange = (field: keyof UserFormData, value: any) => {
    setFormState(prev => {
      const newState = { ...prev, [field]: value };
      
      // Call the onChange prop with the updated form data
      onFormChange(newState);
      
      return newState;
    });
    
    // Update the form field value
    form.setValue(field, value);
  };
  
  return {
    form,
    formState,
    handleFieldChange
  };
}

export default useUserForm;
