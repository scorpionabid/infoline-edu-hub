
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/supabase';
import { NotificationSettings } from '@/types/user';

const notificationFormSchema = z.object({
  email: z.boolean().default(true),
  inApp: z.boolean().default(true),
  push: z.boolean().default(false),
  system: z.boolean().default(true),
  deadline: z.boolean().default(true),
  sms: z.boolean().optional(),
  deadlineReminders: z.boolean().optional()
});

interface PreferencesFormProps {
  user: FullUserData & { notificationSettings?: NotificationSettings };
  onSubmit: (data: Partial<FullUserData & { notificationSettings?: NotificationSettings }>) => Promise<void>;
}

const defaultNotifications: NotificationSettings = {
  email: true,
  inApp: true,
  push: false,
  system: true,
  deadline: true
};

const PreferencesForm: React.FC<PreferencesFormProps> = ({ user, onSubmit }) => {
  const { t } = useLanguage();
  
  const form = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      email: user.notificationSettings?.email ?? defaultNotifications.email,
      inApp: user.notificationSettings?.inApp ?? defaultNotifications.inApp,
      push: user.notificationSettings?.push ?? defaultNotifications.push,
      system: user.notificationSettings?.system ?? defaultNotifications.system,
      deadline: user.notificationSettings?.deadline ?? defaultNotifications.deadline,
      sms: user.notificationSettings?.sms ?? false,
      deadlineReminders: user.notificationSettings?.deadlineReminders ?? false
    }
  });

  const handleSubmit = async (values: z.infer<typeof notificationFormSchema>) => {
    await onSubmit({
      notificationSettings: values
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notificationPreferences')}</CardTitle>
        <CardDescription>{t('notificationPreferencesDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t('emailNotifications')}</FormLabel>
                    <FormDescription>
                      {t('emailNotificationsDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="inApp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t('inAppNotifications')}</FormLabel>
                    <FormDescription>
                      {t('inAppNotificationsDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="system"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t('systemNotifications')}</FormLabel>
                    <FormDescription>
                      {t('systemNotificationsDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>{t('deadlineNotifications')}</FormLabel>
                    <FormDescription>
                      {t('deadlineNotificationsDescription')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit">{t('saveChanges')}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
