
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Demo credentials
  const demoCredentials = [
    { role: 'SuperAdmin', email: 'superadmin@infoline.edu' },
    { role: 'Region Admin', email: 'regionadmin@infoline.edu' },
    { role: 'Sector Admin', email: 'sectoradmin@infoline.edu' },
    { role: 'School Admin', email: 'schooladmin@infoline.edu' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(t('login'), {
        description: 'Please enter both email and password'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('login'), {
        description: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const setDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456'); // Demo password
  };

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
                onClick={() => toast.info(t('resetPassword'), { description: 'Demo functionality' })}
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
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('loading') : t('login')}
          </Button>
        </form>
        
        <div className="mt-8">
          <p className="text-sm text-center text-muted-foreground mb-2">Demo Accounts (Password: 123456)</p>
          <div className="grid grid-cols-2 gap-2">
            {demoCredentials.map((demo) => (
              <Button
                key={demo.email}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setDemoUser(demo.email)}
              >
                {demo.role}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
