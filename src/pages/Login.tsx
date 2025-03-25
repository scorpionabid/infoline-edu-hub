
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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  
  // Daxil olmuş istifadəçini yönləndirmə
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(t('missingCredentials'), {
        description: t('enterEmailAndPassword')
      });
      return;
    }
    
    setLoginInProgress(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // useEffect yönləndirəcək
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('loginFailed'), {
        description: t('unexpectedError')
      });
    } finally {
      setLoginInProgress(false);
    }
  };

  // SuperAdmin yaratma funksiyası
  const createSuperAdmin = async () => {
    try {
      // Supabase functions.url yerinə birbaşa URL istifadə edirik
      const supabaseUrl = "https://olbfnauhzpdskqnxtwav.supabase.co";
      const response = await fetch(`${supabaseUrl}/functions/v1/create-superadmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('SuperAdmin hesabı yaradıldı', {
          description: 'Email: superadmin@infoline.az, Şifrə: Admin123!'
        });
        
        // Avtomatik doldurma
        setEmail('superadmin@infoline.az');
        setPassword('Admin123!');
      } else {
        toast.error('SuperAdmin yaradılmadı', {
          description: data.error || data.message || 'Bilinməyən xəta'
        });
      }
    } catch (error) {
      console.error('SuperAdmin yaratma xətası:', error);
      toast.error('SuperAdmin yaratma zamanı xəta baş verdi');
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
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
        
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            className="text-sm" 
            onClick={createSuperAdmin}
          >
            SuperAdmin Hesabı Yarat
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
