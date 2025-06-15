
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@/types/user';

const formSchema = z.object({
  user_id: z.string().min(1, 'İstifadəçi seçilməlidir'),
});

type FormData = z.infer<typeof formSchema>;

export const useExistingUserForm = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: '',
    },
  });

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    form.setValue('user_id', user.id);
  };

  const getFormData = () => {
    if (!selectedUser) return null;
    
    return {
      user_id: selectedUser.id,
      full_name: selectedUser.full_name,
      email: selectedUser.email,
    };
  };

  return {
    form,
    selectedUser,
    handleUserSelect,
    getFormData,
  };
};
