
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { resetPassword } = useSupabaseAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await resetPassword(email);
      
      if (success) {
        setIsSubmitted(true);
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
        {isSubmitted ? (
          <div className="text-center space-y-4 py-6">
            <h1 className="text-2xl font-bold">{t('checkYourEmail')}</h1>
            <p className="text-muted-foreground">
              {t('passwordResetEmailSent')}
            </p>
            <div className="pt-4">
              <Button 
                className="w-full"
                onClick={() => navigate('/login')}
              >
                {t('backToLogin')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">{t('forgotPassword')}</h1>
              <p className="text-muted-foreground mt-2">{t('enterEmailToReset')}</p>
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
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('sending') : t('resetPassword')}
              </Button>
            </form>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => navigate('/login')}
              >
                <ArrowLeft className="h-4 w-4" />
                {t('backToLogin')}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
