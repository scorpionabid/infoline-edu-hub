
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore, selectIsAuthenticated, selectIsLoading } from '@/hooks/auth/useAuthStore';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

interface LoginFormProps {
  error: string | null;
  clearError: () => void;
}

interface FormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ error, clearError }) => {
  // Use selectors for more efficient state access
  const login = useAuthStore(state => state.login);
  const isLoading = useAuthStore(selectIsLoading);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  
  const { t } = useLanguageSafe();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setError: setFormError,
    reset
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Clear errors when component mounts
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading && !formSubmitting) {
      console.log("[LoginForm] Detected authenticated state, navigating");
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, formSubmitting, navigate, location.state?.from?.pathname]);

  const onSubmit = async (data: FormValues) => {
    try {
      // Prevent multiple submissions
      if (formSubmitting || isAuthenticated) return;
      
      clearError(); // Clear previous errors
      setFormSubmitting(true);
      
      console.log('Giriş cəhdi edilir...', data.email);
      
      const success = await login(data.email, data.password);
      
      if (success) {
        console.log('Giriş uğurlu oldu, autentifikasiya tamamlandı');
        toast.success(t('loginSuccess'));
        reset(); // Clear form fields
        
        // Navigation will happen in the useEffect when isAuthenticated changes
      } else {
        console.log('Giriş uğursuz oldu');
        toast.error(t('invalidCredentials'));
        setFormError('root', { 
          type: 'manual',
          message: t('invalidCredentials')
        });
      }
    } catch (err: any) {
      console.error('Login zamanı xəta baş verdi:', err);
      toast.error(err.message || t('unexpectedError'));
      setFormError('root', { 
        type: 'manual',
        message: err.message || t('unexpectedError')
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Button disabled state
  const isButtonDisabled = isLoading || formSubmitting;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{t('loginTitle')}</CardTitle>
          <LanguageSwitcher />
        </div>
        <CardDescription>{t('loginDescription')}</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {(error || errors.root) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error || errors.root?.message}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isButtonDisabled}
              {...register('email', { 
                required: t('emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('invalidEmail')
                }
              })}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isButtonDisabled}
                {...register('password', { 
                  required: t('passwordRequired'),
                  minLength: {
                    value: 6,
                    message: t('passwordTooShort')
                  }
                })}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                disabled={isButtonDisabled}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isButtonDisabled}
          >
            {isLoading || formSubmitting ? (
              <>
                <span className="mr-2">{t('loggingIn')}</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                {t('loginButton')}
              </>
            )}
          </Button>
          
          <div className="text-sm text-center mt-4 text-muted-foreground">
            <a 
              href="/forgot-password" 
              className="text-primary hover:underline"
            >
              {t('forgotPassword')}
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default React.memo(LoginForm);
