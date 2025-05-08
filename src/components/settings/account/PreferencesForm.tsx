
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/supabase';
import { NotificationSettings } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  email: z.boolean(),
  inApp: z.boolean(),
  push: z.boolean(),
  system: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface PreferencesFormProps {
  user: FullUserData;
  onSubmit: (data: Partial<FullUserData>) => Promise<void>;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ user, onSubmit }) => {
  const { t } = useLanguage();

  // Use default empty notification settings if not provided
  const defaultSettings: FormValues = {
    email: true,
    inApp: true,
    push: false,
    system: true,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.notificationSettings?.email ?? defaultSettings.email,
      inApp: user?.notificationSettings?.inApp ?? defaultSettings.inApp,
      push: user?.notificationSettings?.push ?? defaultSettings.push,
      system: user?.notificationSettings?.system ?? defaultSettings.system,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit({
        notificationSettings: values
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('notificationPreferences')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
              name="push"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t('pushNotifications')}</FormLabel>
                    <FormDescription>
                      {t('pushNotificationsDescription')}
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
            
            <Button type="submit">{t('savePreferences')}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
