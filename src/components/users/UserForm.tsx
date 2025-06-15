import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { UserFormData } from '@/types/user';

const userFormSchema = z.object({
  full_name: z.string().min(2, 'Ad ən az 2 simvoldan ibarət olmalıdır'),
  email: z.string().email('Düzgün email ünvanı daxil edin'),
  phone: z.string().optional(),
  position: z.string().optional(),
  role: z.string().min(1, 'Rol seçilməlidir'),
  region_id: z.string().optional(),
  sector_id: z.string().optional(),
  school_id: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  language: z.string().optional(),
  notifications: z.object({
    email_notifications: z.boolean().optional(),
    sms_notifications: z.boolean().optional(),
    push_notifications: z.boolean().optional(),
  }).optional(),
});

export interface UserFormProps {
  formData: UserFormData;
  onChange: (data: UserFormData) => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: UserFormData;
  isLoading?: boolean;
  isEditMode?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  onChange,
  onSubmit,
  initialData,
  isLoading = false,
  isEditMode = false
}) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData || formData,
  });

  const handleSubmit = async (data: UserFormData) => {
    onChange(data);
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Form content will be implemented based on requirements */}
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saxlanılır...' : isEditMode ? 'Yenilə' : 'Yarat'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;
