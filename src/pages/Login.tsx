import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('superadmin@infoline.az');
  const [password, setPassword] = useState('Admin123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [directLoginError, setDirectLoginError] = useState<string | null>(null);
  
  // Daxil olmuş istifadəçini yönləndirmə
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log(`İstifadəçi auth olundu, "${from}" səhifəsinə yönləndirilir`);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Xəta olduqda və istifadəçi form-a dəyişiklik etdikdə xətanı təmizləyək
  useEffect(() => {
    if (error) {
      clearError();
    }
    if (directLoginError) {
      setDirectLoginError(null);
    }
  }, [email, password, error, clearError]);

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
      
      // Birbaşa login cəhdi
      await handleDirectLogin();
    } catch (error: any) {
      console.error('Login error:', error);
      // Xətaları context vasitəsilə idarə edirik
    } finally {
      setLoginInProgress(false);
    }
  };

  // Birbaşa login cəhdi
  const handleDirectLogin = async () => {
    try {
      setLoginInProgress(true);
      clearError();
      setDirectLoginError(null);
      
      console.log('Birbaşa login cəhdi edilir...');
      
      // Əvvəlcə mövcud sessiyaları təmizləyək
      await supabase.auth.signOut();
      
      // Direct login with Admin API - artıq supabaseKey-i birbaşa istifadə etmirik
      const functionUrl = 'https://olbfnauhzpdskqnxtwav.supabase.co/functions/v1/direct-login';
      
      console.log('Function URL:', functionUrl);
      console.log('Request payload:', { email, password });
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Bearer token olmadan sadəcə anonymous çağırırıq
        },
        body: JSON.stringify({
          email: email || 'superadmin@infoline.az',
          password: password || 'Admin123!'
        })
      });
      
      console.log('Direct login status kodu:', response.status);
      
      // İlk olaraq text() olaraq responseni alaq və sonra JSON-a çevirək - debugging üçün
      const responseText = await response.text();
      console.log('Direct login xam cavabı:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parse xətası:', e);
        throw new Error('Server cavabı düzgün format deyil');
      }
      
      console.log('Direct login cavabı:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Birbaşa login uğursuz oldu');
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
        
        toast.success('Birbaşa login uğurlu oldu');
        
        // setSession çağrışından sonra bir qədər gözləyək ki, onAuthStateChange tetiklənsin
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        throw new Error('Sessiya qaytarılmadı');
      }
    } catch (error: any) {
      console.error('Direct login error:', error);
      setDirectLoginError(error.message || 'Gözlənilməz xəta');
      toast.error('Birbaşa login uğursuz oldu', {
        description: error.message || 'Gözlənilməz xəta'
      });
      
      // Normal giriş işə düşməsə, alternativ təqdim edilir
      try {
        console.log("Normal login cəhdi edilir...");
        // Normal giriş metodu ilə cəhd edək
        const success = await login(email, password);
        
        if (success) {
          console.log('Login uğurlu oldu');
          toast.success(t('loginSuccess'));
        }
      } catch (loginError: any) {
        console.error("Normal login xətası:", loginError);
      }
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
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {directLoginError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{directLoginError}</AlertDescription>
          </Alert>
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
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>SuperAdmin: <span className="font-medium">superadmin@infoline.az</span></p>
          <p>Şifrə: <span className="font-medium">Admin123!</span></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
