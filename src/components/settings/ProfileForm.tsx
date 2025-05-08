
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { useForm } from 'react-hook-form';
import { User } from '@/types/user';

interface ProfileFormProps {
  user?: User;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSubmit, loading }) => {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      position: user?.position || ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">{t('fullName')}</Label>
        <Input 
          id="full_name" 
          {...register('full_name', { required: t('fullNameRequired') })}
        />
        {errors.full_name && (
          <p className="text-sm text-red-500">{errors.full_name.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input 
          id="email" 
          type="email"
          {...register('email', { 
            required: t('emailRequired'),
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: t('invalidEmail')
            }
          })}
          disabled
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message as string}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">{t('phone')}</Label>
        <Input 
          id="phone" 
          {...register('phone')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position">{t('position')}</Label>
        <Input 
          id="position" 
          {...register('position')}
        />
      </div>
      
      <Button type="submit" disabled={loading}>
        {loading ? t('saving') : t('saveChanges')}
      </Button>
    </form>
  );
};

export default ProfileForm;
