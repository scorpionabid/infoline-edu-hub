
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Şifrə dəyişdirmə forması üçün schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'required'),
  newPassword: z.string().min(6, 'passwordTooShort'),
  confirmPassword: z.string().min(1, 'required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'passwordMismatch',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;

const PasswordChangeForm: React.FC = () => {
  const { t } = useLanguage();
  
  // Şifrə dəyişdirmə forması
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });
  
  // Şifrə dəyişdirmə funksiyası
  const handlePasswordChange = (data: PasswordFormData) => {
    // Simulyasiya et - real tətbiqdə burada API olacaq
    setTimeout(() => {
      toast.success(t('passwordChanged'));
      passwordForm.reset();
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('changePassword')}</CardTitle>
        <CardDescription>
          {t('changePasswordDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('currentPassword')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('newPassword')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting ? t('updating') : t('updatePassword')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeForm;
