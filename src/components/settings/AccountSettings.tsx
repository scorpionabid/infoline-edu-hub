
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { FullUserData, NotificationSettings } from '@/types/user';
import { updateUserProfile } from '@/api/userApi';

const notificationSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(false),
  inApp: z.boolean().default(true),
  system: z.boolean().default(true),
  deadline: z.boolean().default(true),
});

const formSchema = z.object({
  notificationSettings: notificationSchema
});

type FormValues = z.infer<typeof formSchema>;

const AccountSettings = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get notification settings from user with proper fallback
  const defaultSettings: NotificationSettings = {
    email: true,
    push: false,
    inApp: true,
    system: true,
    deadline: true
  };

  // Use either notification_settings or notificationSettings, with fallback to defaults
  const notificationSettings = user?.notificationSettings || user?.notification_settings || defaultSettings;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notificationSettings: {
        email: notificationSettings.email,
        push: notificationSettings.push,
        inApp: notificationSettings.inApp || false,
        system: notificationSettings.system || false,
        deadline: notificationSettings.deadline || false
      }
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Update user data with the correct property name (notificationSettings)
      const updatedUser: Partial<FullUserData> = {
        notificationSettings: {
          email: data.notificationSettings.email,
          push: data.notificationSettings.push,
          inApp: data.notificationSettings.inApp,
          system: data.notificationSettings.system,
          deadline: data.notificationSettings.deadline
        }
      };

      // Call API to update user profile
      await updateUserProfile(user.id, updatedUser);

      // Update local user state - keep both properties for compatibility
      updateUser({
        notificationSettings: updatedUser.notificationSettings,
        notification_settings: updatedUser.notificationSettings
      });

      toast(t('settingsSaved'), {
        description: t('notificationSettingsUpdated')
      });
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      toast(t('errorOccurred'), {
        description: error.message || t('failedToUpdateSettings'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('notificationSettings')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notificationSettings.email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('emailNotifications')}</FormLabel>
                      <FormDescription>{t('emailNotificationsDesc')}</FormDescription>
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
                name="notificationSettings.inApp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('inAppNotifications')}</FormLabel>
                      <FormDescription>{t('inAppNotificationsDesc')}</FormDescription>
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
                name="notificationSettings.push"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('pushNotifications')}</FormLabel>
                      <FormDescription>{t('pushNotificationsDesc')}</FormDescription>
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
                name="notificationSettings.system"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('systemNotifications')}</FormLabel>
                      <FormDescription>{t('systemNotificationsDesc')}</FormDescription>
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
                name="notificationSettings.deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('deadlineNotifications')}</FormLabel>
                      <FormDescription>{t('deadlineNotificationsDesc')}</FormDescription>
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
            </div>

            <Separator />

            <Button type="submit" disabled={isSubmitting} className="ml-auto">
              {isSubmitting ? t('saving') : t('saveSettings')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
