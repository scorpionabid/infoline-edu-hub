
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Keçərli email ünvanı daxil edin' }),
  password: z.string().min(6, { message: 'Şifrə ən azı 6 simvol olmalıdır' })
});

export interface LoginFormProps {
  error?: string;
  clearError?: () => void;
  onSubmit?: (email: string, password: string) => Promise<void>;
  isSubmitting?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  error,
  clearError,
  onSubmit,
  isSubmitting = false
}) => {
  const { t } = useLanguage();
  
  // Form state management using React Hook Form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  // Form submission handler
  const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
    if (clearError) clearError();
    if (onSubmit) await onSubmit(values.email, values.password);
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="info@example.com" 
                    type="email" 
                    autoComplete="email" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    autoComplete="current-password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('login')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
