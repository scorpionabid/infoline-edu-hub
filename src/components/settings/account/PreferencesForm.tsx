
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

// Hesab parametrləri forması üçün schema
const settingsFormSchema = z.object({
  language: z.string(),
  twoFactorEnabled: z.boolean().default(false),
  notificationSettings: z.object({
    email: z.boolean().default(true),
    system: z.boolean().default(true),
  }),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

const PreferencesForm: React.FC = () => {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  
  // Hesab parametrləri forması
  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      language: localStorage.getItem('infoline-language') || 'az',
      notificationSettings: {
        email: true,
        system: true,
      },
      twoFactorEnabled: false,
    }
  });
  
  // Hesab parametrlərini saxla
  const saveSettings = (data: SettingsFormData) => {
    // Dil dəyişdiklərini saxla
    localStorage.setItem('infoline-language', data.language);
    
    // İstifadəçi məlumatlarını yenilə - User tipində yalnız mövcud olan xüsusiyyətləri istifadə et
    if (user) {
      updateUser({
        ...user,
        twoFactorEnabled: data.twoFactorEnabled,
        notificationSettings: data.notificationSettings
      });
      
      // Dil dəyişikliyini bildirmək üçün məlumat göstəririk
      toast.success(t('languageChanged'));
    }
    
    toast.success(t('settingsSaved'));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('accountPreferences')}</CardTitle>
        <CardDescription>
          {t('accountPreferencesDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...settingsForm}>
          <form className="space-y-6" onSubmit={settingsForm.handleSubmit(saveSettings)}>
            {/* Dil Seçimi */}
            <FormField
              control={settingsForm.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('language')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectLanguage')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="az">{t('azerbaijani')}</SelectItem>
                      <SelectItem value="en">{t('english')}</SelectItem>
                      <SelectItem value="ru">{t('russian')}</SelectItem>
                      <SelectItem value="tr">{t('turkish')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Əlavə parametrlər */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('additionalSettings')}</h3>

              <FormField
                control={settingsForm.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>{t('twoFactorAuth')}</FormLabel>
                      <p className="text-sm text-muted-foreground">{t('twoFactorAuthDesc')}</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                )}
              />

              <FormField
                control={settingsForm.control}
                name="notificationSettings.email"
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>{t('emailNotifications')}</FormLabel>
                      <p className="text-sm text-muted-foreground">{t('emailNotificationsDesc')}</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                )}
              />

              <FormField
                control={settingsForm.control}
                name="notificationSettings.system"
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>{t('systemNotifications')}</FormLabel>
                      <p className="text-sm text-muted-foreground">{t('systemNotificationsDesc')}</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                )}
              />
            </div>
            
            <CardFooter className="px-0 pt-4">
              <Button 
                type="submit"
                disabled={settingsForm.formState.isSubmitting}
              >
                {settingsForm.formState.isSubmitting ? t('saving') : t('saveSettings')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PreferencesForm;
