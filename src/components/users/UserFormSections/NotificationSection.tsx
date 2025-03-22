
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UserFormData } from '@/types/user';

interface NotificationSectionProps {
  form: any;
  data: UserFormData;
  onFormChange: (fieldName: string, value: any) => void;
}

const NotificationSection: React.FC<NotificationSectionProps> = ({
  form,
  data,
  onFormChange,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('additionalSettings')}</h3>

      <FormField
        control={form.control}
        name="twoFactorEnabled"
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel>{t('twoFactorAuth')}</FormLabel>
              <FormDescription>{t('twoFactorAuthDesc')}</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  onFormChange('twoFactorEnabled', checked);
                }}
              />
            </FormControl>
          </div>
        )}
      />

      <FormField
        control={form.control}
        name="notificationSettings.email"
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel>{t('emailNotifications')}</FormLabel>
              <FormDescription>{t('emailNotificationsDesc')}</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  onFormChange('notificationSettings', {
                    ...data.notificationSettings,
                    email: checked,
                  });
                }}
              />
            </FormControl>
          </div>
        )}
      />

      <FormField
        control={form.control}
        name="notificationSettings.system"
        render={({ field }) => (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel>{t('systemNotifications')}</FormLabel>
              <FormDescription>{t('systemNotificationsDesc')}</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value || false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  onFormChange('notificationSettings', {
                    ...data.notificationSettings,
                    system: checked,
                  });
                }}
              />
            </FormControl>
          </div>
        )}
      />
    </div>
  );
};

export default NotificationSection;
