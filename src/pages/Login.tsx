
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('superadmin@infoline.az');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Daxil olmuş istifadəçini yönləndirmə
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Xəta mesajını sıfırlayaq
    setErrorMessage('');
    
    if (!email || !password) {
      toast.error(t('missingCredentials'), {
        description: t('enterEmailAndPassword')
      });
      return;
    }
    
    setLoginInProgress(true);
    
    try {
      console.log('Login prosesi başladı');
      
      // Auth context vasitəsilə giriş
      const success = await login(email, password);
      
      if (success) {
        toast.success(t('loginSuccess'));
        // Yönləndirilmə auth context-in useEffect-i tərəfindən ediləcək
      } else {
        setErrorMessage(t('loginFailed'));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMsg = error.message || t('unexpectedError');
      
      // Daha spesifik xəta mesajları
      if (error.status === 500) {
        errorMsg = t('databaseError');
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMsg = t('invalidCredentials');
      } else if (error.message?.includes('Email not confirmed')) {
        errorMsg = t('emailNotConfirmed');
      }
      
      setErrorMessage(errorMsg);
      
      toast.error(t('loginFailed'), {
        description: errorMsg
      });
    } finally {
      setLoginInProgress(false);
    }
  };

  // Manual login attempt
  const handleDirectLogin = async () => {
    setLoginInProgress(true);
    setErrorMessage('');
    
    try {
      console.log('Birbaşa login cəhdi edilir...');
      
      // Direct login with Admin API
      const functionUrl = 'https://olbfnauhzpdskqnxtwav.supabase.co/functions/v1/direct-login';
      
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
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Direct login xətası:', errorData);
        throw new Error(errorData.error || 'Birbaşa login uğursuz oldu');
      }
      
      const data = await response.json();
      console.log('Direct login cavabı:', data);
      
      if (data.session) {
        // Sessiyanı manual olaraq təyin edək
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        toast.success('Birbaşa login uğurlu oldu');
        navigate('/dashboard');
      } else {
        throw new Error('Sessiya qaytarılmadı');
      }
    } catch (error: any) {
      console.error('Direct login error:', error);
      setErrorMessage(error.message || 'Birbaşa login zamanı gözlənilməz xəta');
      
      toast.error('Birbaşa login uğursuz oldu', {
        description: error.message || 'Gözlənilməz xəta'
      });
    } finally {
      setLoginInProgress(false);
    }
  };

  // Yüklənmə zamanı göstəriləcək
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden grid-pattern">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-infoline-100/30 rounded-bl-full -z-10" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-infoline-100/30 rounded-tr-full -z-10" />
      
      {/* Theme and language toggles */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <ThemeToggle />
        <LanguageSelector />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-lg w-full max-w-md p-8 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-lg text-white text-xl font-bold flex items-center justify-center">
              IL
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-4">InfoLine</h1>
          <p className="text-muted-foreground mt-2">Məktəb Məlumatları Toplama Sistemi</p>
        </div>
        
        {errorMessage && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
            {errorMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
        
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium mb-2">Alternativ giriş üsulu</h3>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleDirectLogin}
            disabled={loginInProgress}
          >
            Birbaşa Supabase ilə daxil ol
          </Button>
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>SuperAdmin: <span className="font-medium">superadmin@infoline.az</span></p>
          <p>Şifrə: <span className="font-medium">Admin123!</span></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
