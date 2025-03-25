import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

const ResetPassword = () => {
  const { updatePassword } = useSupabaseAuth();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Əgər istifadəçi daxil olmayıbsa, login səhifəsinə yönləndiririk
  useEffect(() => {
    // Burada URL parametrlərini də yoxlaya bilərik
    // Şifrə yeniləmə linki Supabase tərəfindən göndərilir və hash parametri olur
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!password || !confirmPassword) {
      toast.error(t('missingFields'), {
        description: t('enterBothPasswords')
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'), {
        description: t('enterSamePassword')
      });
      return;
    }
    
    if (password.length < 6) {
      toast.error(t('passwordTooShort'), {
        description: t('passwordMinLength')
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await updatePassword(password);
      
      if (success) {
        // If already logged in, redirect to dashboard
        if (isAuthenticated) {
          navigate('/dashboard');
        } else {
          // Otherwise redirect to login
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold">{t('resetPassword')}</h1>
          <p className="text-muted-foreground mt-2">{t('enterNewPassword')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('updating') : t('updatePassword')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
