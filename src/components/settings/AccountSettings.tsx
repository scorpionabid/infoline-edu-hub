
import React, { useState, useEffect } from 'react';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { FullUserData } from '@/types/user';

// Import the updateUserProfile function
import { updateUserProfile } from '@/hooks/auth/authActions';

const profileFormSchema = z.object({
  full_name: z.string().min(2, {
    message: "Ad və soyad ən azı 2 simvol olmalıdır.",
  }).max(50, {
    message: "Ad və soyad 50 simvolu keçməməlidir.",
  }).optional(),
  phone: z.string().optional(),
  language: z.string().optional(),
  notificationSettings: z.object({
    email: z.boolean().default(false),
    inApp: z.boolean().default(false),
    push: z.boolean().default(false),
    system: z.boolean().default(false),
    deadline: z.boolean().default(false)
  }).optional()
});

export const AccountSettings = () => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the refreshSession function directly from the store
  const refreshSession = useAuthStore((state) => state.refreshSession);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      language: user?.language || "az",
      notificationSettings: user?.notification_settings || user?.notificationSettings || {
        email: false,
        inApp: false,
        push: false,
        system: false,
        deadline: false
      }
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        full_name: user.full_name || "",
        phone: user.phone || "",
        language: user.language || "az",
        notificationSettings: user?.notification_settings || user?.notificationSettings || {
          email: false,
          inApp: false,
          push: false,
          system: false,
          deadline: false
        }
      });
    }
  }, [user, profileForm]);

  const handleUpdateUserProfile = async (data: z.infer<typeof profileFormSchema>) => {
    try {
      setIsSubmitting(true);
    
      // Properly format the notification settings to match the expected structure
      const notificationSettings = {
        email: data.notificationSettings?.email || false,
        inApp: data.notificationSettings?.inApp || false,
        push: data.notificationSettings?.push || false,
        system: data.notificationSettings?.system || false,
        deadline: data.notificationSettings?.deadline || false
      };

      const userUpdateData: Partial<FullUserData> = {
        ...data,
        id: user?.id,
        notificationSettings
      };

      await updateUserProfile(userUpdateData);
      toast.success(t('profileUpdated'));
      
      // Refresh the session to get updated user data
      if (refreshSession) {
        await refreshSession();
      }
    } catch (error) {
      toast.error(t('profileUpdateFailed'));
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(handleUpdateUserProfile)} className="space-y-8">
        <div className="grid gap-4">
          <FormField
            control={profileForm.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fullName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterFullName')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterPhone')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('language')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterLanguage')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="notificationSettings.email"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{t('emailNotifications')}</FormLabel>
                  <FormDescription>
                    {t('emailNotificationsDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="notificationSettings.inApp"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{t('inAppNotifications')}</FormLabel>
                  <FormDescription>
                    {t('inAppNotificationsDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="notificationSettings.push"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{t('pushNotifications')}</FormLabel>
                  <FormDescription>
                    {t('pushNotificationsDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="notificationSettings.system"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{t('systemNotifications')}</FormLabel>
                  <FormDescription>
                    {t('systemNotificationsDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={profileForm.control}
            name="notificationSettings.deadline"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{t('deadlineReminders')}</FormLabel>
                  <FormDescription>
                    {t('deadlineRemindersDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('updating') : t('updateProfile')}
        </Button>
      </form>
    </Form>
  );
};

export default AccountSettings;
