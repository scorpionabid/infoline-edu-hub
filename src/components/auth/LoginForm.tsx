
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  directLoginError: string | null;
  setDirectLoginError: (error: string | null) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ directLoginError, setDirectLoginError }) => {
  const { login, error, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('superadmin@infoline.az');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  
  // Xəta olduqda və istifadəçi form-a dəyişiklik etdikdə xətanı təmizləyək
  useEffect(() => {
    if (error) {
      clearError();
    }
    if (directLoginError) {
      setDirectLoginError(null);
    }
  }, [email, password, error, clearError, directLoginError, setDirectLoginError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Yeni girişdən əvvəl xətaları təmizləyək
    clearError();
    setDirectLoginError(null);
    
    if (!email || !password) {
      toast.error(t('missingCredentials'), {
        description: t('enterEmailAndPassword')
      });
      return;
    }
    
    setLoginInProgress(true);
    
    try {
      console.log('Login prosesi başladı');
      
      // Əvvəlcə mövcud sessiyaları təmizləyək
      await supabase.auth.signOut();
      
      // Təhlükəsiz login cəhdi - yeni edge function vasitəsilə
      const safeLoginSuccess = await handleSafeLogin();
      
      // Əgər təhlükəsiz login uğursuz olsa, normal login metodu ilə cəhd edək
      if (!safeLoginSuccess) {
        console.log('Normal login cəhdi edilir');
        const success = await login(email, password);
        
        if (success) {
          console.log('Normal login uğurlu oldu');
          toast.success(t('loginSuccess'));
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Xətaları context vasitəsilə idarə edirik
    } finally {
      setLoginInProgress(false);
    }
  };

  // Təhlükəsiz login cəhdi - yeni edge function
  const handleSafeLogin = async (): Promise<boolean> => {
    try {
      console.log('Təhlükəsiz login cəhdi edilir...');
      
      // Edge Function URL-i
      const functionUrl = 'https://olbfnauhzpdskqnxtwav.supabase.co/functions/v1/safe-login';
      
      console.log('Function URL:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || 'superadmin@infoline.az',
          password: password || 'Admin123!'
        })
      });
      
      console.log('Safe login status kodu:', response.status);
      
      // İlk olaraq text() olaraq responseni alaq və sonra JSON-a çevirək - debugging üçün
      const responseText = await response.text();
      console.log('Safe login xam cavabı:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parse xətası:', e);
        throw new Error('Server cavabı düzgün format deyil');
      }
      
      console.log('Safe login cavabı:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Təhlükəsiz login uğursuz oldu');
      }
      
      if (responseData.session) {
        // Sessiyanı manual olaraq təyin edək
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: responseData.session.access_token,
          refresh_token: responseData.session.refresh_token
        });
        
        if (sessionError) {
          console.error("Sessiya təyin etmə xətası:", sessionError);
          throw sessionError;
        }
        
        toast.success(t('loginSuccess'));
        
        // setSession çağrışından sonra bir qədər gözləyək ki, onAuthStateChange tetiklənsin
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        
        return true;
      } else {
        throw new Error('Sessiya qaytarılmadı');
      }
    } catch (error: any) {
      console.error('Safe login error:', error);
      setDirectLoginError(error.message || 'Gözlənilməz xəta');
      toast.error('Təhlükəsiz login uğursuz oldu', {
        description: error.message || 'Gözlənilməz xəta'
      });
      
      return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {directLoginError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{directLoginError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">{t('emailAddress')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="pl-10"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t('password')}</Label>
          <Button
            variant="link"
            size="sm"
            className="text-xs p-0 h-auto text-muted-foreground"
            onClick={() => navigate('/forgot-password')}
            type="button"
          >
            {t('forgotPassword')}
          </Button>
        </div>
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
      
      <Button type="submit" className="w-full" disabled={loginInProgress}>
        {loginInProgress ? t('loggingIn') : t('login')}
      </Button>
    </form>
  );
};

export default LoginForm;
