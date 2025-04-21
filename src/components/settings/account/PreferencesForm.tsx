import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const initialValues = {
  language: user?.language || 'az',
  notifications: {
    email: user?.notificationSettings?.email ?? true,
    push: user?.notificationSettings?.push ?? false,
    inApp: user?.notificationSettings?.inApp ?? true
  }
};

// FormSchema tipini düzəldək
const FormSchema = z.object({
  language: z.string(),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    inApp: z.boolean().default(true)
  })
});

const PreferencesForm = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSaving(true);
    
    try {
      if (updateUser) {
        // Notification settings burada düzəldilir - system yerine inApp istifadə edilir
        const success = await updateUser({
          language: data.language,
          notificationSettings: {
            email: data.notifications.email,
            push: data.notifications.push,
            inApp: data.notifications.inApp
          }
        });
        
        if (success) {
          toast.success(t('preferencesUpdated'));
        } else {
          toast.error(t('errorUpdatingPreferences'));
        }
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(t('errorUpdatingPreferences'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h3 className="text-lg font-medium">{t('languagePreferences')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('selectYourPreferredLanguage')}
            </p>
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('language')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium">{t('notificationPreferences')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('manageYourNotificationSettings')}
            </p>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notifications.email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('emailNotifications')}</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {t('receiveEmailNotifications')}
                      </p>
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
                name="notifications.push"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('pushNotifications')}</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {t('receivePushNotifications')}
                      </p>
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
                name="notifications.inApp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('inAppNotifications')}</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {t('receiveInAppNotifications')}
                      </p>
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
          </div>
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t('saving') : t('saveChanges')}
        </Button>
      </form>
    </Form>
  );
};

export default PreferencesForm;
