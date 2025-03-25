
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

const RegisterSuccess = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
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
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold">{t('registerSuccess')}</h1>
          
          <p className="text-muted-foreground">
            {t('registerSuccessDescription')}
          </p>
          
          <div className="w-full pt-4">
            <Button 
              className="w-full mb-4"
              onClick={() => navigate('/login')}
            >
              {t('goToLogin')}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('backToHome')}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterSuccess;
