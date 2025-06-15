
import { useState } from 'react';
import { UserRole } from '@/types/auth';

export interface ExistingUserFormData {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

export const useExistingUserForm = () => {
  const [formData, setFormData] = useState<ExistingUserFormData>({
    userId: '',
    email: '',
    name: '',
    role: 'sectoradmin' as UserRole
  });

  const updateFormData = (updates: Partial<ExistingUserFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleUserSelect = (user: any) => {
    updateFormData({
      userId: user.id,
      email: user.email,
      name: user.full_name || user.name,
      role: 'sectoradmin' as UserRole
    });
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      email: '',
      name: '',
      role: 'sectoradmin' as UserRole
    });
  };

  return {
    formData,
    updateFormData,
    handleUserSelect,
    resetForm
  };
};
