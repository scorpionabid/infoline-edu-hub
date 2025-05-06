import React, { useEffect } from 'react';
import { FormItem, FormLabel, FormDescription, FormControl, FormField } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '@/context/LanguageContext';
import { UseFormReturn } from 'react-hook-form';
import { UserFormData } from '@/types/user';

const NotificationSection = ({ form }: { form: UseFormReturn<UserFormData> }) => {
  const { t } = useLanguage();
  
  // UserFormData tipini genişlətmək lazımdır, lakin o hal-hazırda
  // mövcud deyil ya da yenidən düzənləmək gerekir
  
  // Bu hissəni form içərisində əlavə edək
  useEffect(() => {
    const currentValues = form.getValues();
    
    // Əgər notificationSettings mövcud deyilsə, varsayılan dəyərlər təyin edək
    if (!currentValues.notificationSettings) {
      form.setValue('notificationSettings', {
        email: true,
        inApp: true,
        sms: false,
        deadlineReminders: true,
        system: true
      });
    }
  }, [form]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t('notificationSettings')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('notificationSettingsDescription')}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="notificationSettings.email"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t('emailNotifications')}
                </FormLabel>
                <FormDescription>
                  {t('emailNotificationsDescription')}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notificationSettings.inApp"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t('inAppNotifications')}
                </FormLabel>
                <FormDescription>
                  {t('inAppNotificationsDescription')}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default NotificationSection;
