
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { FullUserData } from '@/types/user';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';

const ProfileSettings = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      position: user?.position || '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const updateData = {
        full_name: data.full_name,
        phone: data.phone,
        position: data.position,
      };
      
      await updateUser(updateData);
      toast.success(t('profileUpdated'));
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(t('profileUpdateError'), {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Default fallback for avatar
  const fallbackInitials = user?.full_name
    ? user.full_name.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('profileSettings')}</h2>
      <p className="text-muted-foreground">{t('profileSettingsDescription')}</p>
      
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={user?.avatar} 
              alt={user?.full_name || t('user')} 
            />
            <AvatarFallback className="text-lg">{fallbackInitials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-1">
            <h3 className="text-lg font-medium">{user?.full_name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground">
              {t('role')}: {t(user?.role?.toString().toLowerCase() || 'user')}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">{t('fullName')}</Label>
            <Input
              id="full_name"
              {...form.register('full_name')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              {...form.register('email')}
              disabled
            />
            <p className="text-xs text-muted-foreground">{t('cannotChangeEmail')}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              {...form.register('phone')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">{t('position')}</Label>
            <Input
              id="position"
              {...form.register('position')}
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSettings;
