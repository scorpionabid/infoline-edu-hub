
import { useState, useCallback } from 'react';
import { UserFormData } from '@/types/user';
import { useForm } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface UseUserFormProps {
  initialData: UserFormData;
  onFormChange: (data: UserFormData) => void;
  passwordRequired?: boolean;
}

export const useUserForm = ({ initialData, onFormChange, passwordRequired }: UseUserFormProps) => {
  // Validation Schema
  const formSchema = z.object({
    name: z.string().min(2, { message: "Ad ən azı 2 simvol olmalıdır" }),
    email: z.string().email({ message: "Düzgün e-poçt daxil edin" }),
    password: passwordRequired 
      ? z.string().min(6, { message: "Şifrə ən azı 6 simvol olmalıdır" }) 
      : z.string().optional(),
    confirmPassword: passwordRequired 
      ? z.string().min(6, { message: "Şifrə təkrarı ən azı 6 simvol olmalıdır" }) 
      : z.string().optional(),
    role: z.string(),
    regionId: z.string().optional(),
    sectorId: z.string().optional(),
    schoolId: z.string().optional(),
    phone: z.string().optional(),
    position: z.string().optional(),
    language: z.string().optional(),
    status: z.string().optional(),
  }).refine(data => {
    if (passwordRequired) {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: "Şifrələr eyni deyil",
    path: ["confirmPassword"],
  });

  // Form hook istifadə et
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      password: initialData.password || '',
      confirmPassword: initialData.confirmPassword || '',
      role: initialData.role || 'schooladmin',
      regionId: initialData.regionId || '',
      sectorId: initialData.sectorId || '',
      schoolId: initialData.schoolId || '',
      phone: initialData.phone || '',
      position: initialData.position || '',
      language: initialData.language || 'az',
      status: initialData.status || 'active',
    },
  });
  
  // Sahələrin dəyişməsini idarə et
  const handleFieldChange = useCallback((field: keyof UserFormData, value: any) => {
    form.setValue(field as any, value);
    
    const updatedData = { ...initialData, [field]: value };
    
    // Region dəyişdirildikdə sektoru sıfırla
    if (field === 'regionId') {
      form.setValue('sectorId', '');
      updatedData.sectorId = '';
    }
    
    // Sektor dəyişdirildikdə məktəbi sıfırla
    if (field === 'sectorId') {
      form.setValue('schoolId', '');
      updatedData.schoolId = '';
    }
    
    onFormChange(updatedData);
  }, [form, initialData, onFormChange]);
  
  return {
    form,
    handleFieldChange,
  };
};
