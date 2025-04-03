
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock } from 'lucide-react';
import LoginBackgroundDecorations from '@/components/auth/LoginBackgroundDecorations';

const ResetPassword = () => {
  const { confirmPasswordReset, error, isLoading, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetInProgress, setResetInProgress] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Xəta olduqda və istifadəçi form-a dəyişiklik etdikdə xətanı təmizləyək
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [password, confirmPassword, error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    clearError();
    
    if (!password || !confirmPassword) {
      toast.error(t('passwordRequired'));
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }
    
    if (password.length < 6) {
      toast.error(t('passwordTooShort'));
      return;
    }
    
    setResetInProgress(true);
    
    try {
      await confirmPasswordReset(password);
      setResetSuccess(true);
      toast.success(t('passwordResetSuccess'), {
        description: t('passwordResetSuccessDescription')
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
    } finally {
      setResetInProgress(false);
    }
  };

  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          to="/login"
          className="absolute left-4 top-4 md:left-8 md:top-8 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
        >
          {t('backToLogin')}
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-black/80" />
          <LoginBackgroundDecorations />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <img
              src="/placeholder.svg"
              alt="Logo"
              className="h-8 w-auto mr-2"
            />
            InfoLine
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                {t('welcomeMessage')}
              </p>
              <footer className="text-sm">InfoLine Education System</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold tracking-tight">{t('resetPassword')}</h1>
                <p className="text-muted-foreground mt-2">{t('resetPasswordDescription')}</p>
              </div>
              
              {resetSuccess ? (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <AlertDescription>{t('passwordResetSuccess')}. {t('redirectingToLogin')}...</AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error.toString()}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('newPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={resetInProgress}>
                    {resetInProgress ? t('resettingPassword') : t('resetPassword')}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
