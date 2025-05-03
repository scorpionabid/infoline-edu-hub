
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
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
import LanguageSelector from '@/components/LanguageSelector';

interface LoginFormProps {
  error: string | null;
  clearError: () => void;
}

interface FormValues {
  email: string;
  password: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ error, clearError }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setError: setFormError
  } = useForm<FormValues>();

  // Səhifə yüklənəndə xəta mesajını təmizləyək
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      if (clearError) clearError();
      setLoginInProgress(true);
      console.log('Giriş cəhdi edilir...', data.email);
      
      const success = await login(data.email, data.password);
      
      if (success) {
        console.log('Giriş uğurlu oldu, yönləndirmə edilir...');
        toast.success(t('loginSuccess'));
        // Yönləndirməyi burada etmirik, çünki useEffect hook-da ediləcək
      } else {
        console.log('Giriş uğursuz oldu');
        setFormError('root', { 
          type: 'manual',
          message: t('invalidCredentials')
        });
      }
    } catch (err: any) {
      console.error('Login zamanı xəta baş verdi:', err);
      setFormError('root', { 
        type: 'manual',
        message: err.message || t('unexpectedError')
      });
    } finally {
      setLoginInProgress(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{t('loginTitle')}</CardTitle>
          <LanguageSelector />
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
            disabled={loginInProgress}
          >
            {loginInProgress ? (
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

export default LoginForm;
