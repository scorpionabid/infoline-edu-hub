
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguageSafe } from '@/context/LanguageContext';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PreferencesFormProps {
  user?: FullUserData;
  onSubmit: (data: Partial<FullUserData>) => Promise<void>;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ user, onSubmit }) => {
  const { t } = useLanguageSafe();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      email: (user?.notificationSettings?.email ?? true),
      inApp: (user?.notificationSettings?.inApp ?? true),
      push: (user?.notificationSettings?.push ?? true),
      system: (user?.notificationSettings?.system ?? true),
    }
  });

  const handleFormSubmit = async (formData: any) => {
    setLoading(true);
    try {
      await onSubmit({
        notificationSettings: {
          email: formData.email,
          inApp: formData.inApp,
          push: formData.push,
          system: formData.system,
          deadline: true,
        }
      } as Partial<FullUserData>);
      toast.success(t('preferencesSaved'));
    } catch (error) {
      toast.error(t('errorSavingPreferences'));
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">{t('emailNotifications')}</Label>
            <p className="text-sm text-muted-foreground">{t('emailNotificationsDesc')}</p>
          </div>
          <Switch
            id="email-notifications"
            {...register('email')}
            checked={watch('email')}
            onCheckedChange={(checked) => setValue('email', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="in-app-notifications">{t('inAppNotifications')}</Label>
            <p className="text-sm text-muted-foreground">{t('inAppNotificationsDesc')}</p>
          </div>
          <Switch
            id="in-app-notifications"
            {...register('inApp')}
            checked={watch('inApp')}
            onCheckedChange={(checked) => setValue('inApp', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">{t('pushNotifications')}</Label>
            <p className="text-sm text-muted-foreground">{t('pushNotificationsDesc')}</p>
          </div>
          <Switch
            id="push-notifications"
            {...register('push')}
            checked={watch('push')}
            onCheckedChange={(checked) => setValue('push', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="system-notifications">{t('systemNotifications')}</Label>
            <p className="text-sm text-muted-foreground">{t('systemNotificationsDesc')}</p>
          </div>
          <Switch
            id="system-notifications"
            {...register('system')}
            checked={watch('system')}
            onCheckedChange={(checked) => setValue('system', checked)}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('saving')}
          </>
        ) : (
          t('savePreferences')
        )}
      </Button>
    </form>
  );
};

export default PreferencesForm;
