
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginBackgroundDecorations from '@/components/auth/LoginBackgroundDecorations';
import LoginCredentials from '@/components/auth/LoginCredentials';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [directLoginError, setDirectLoginError] = useState<string | null>(null);
  
  // Daxil olmuş istifadəçini yönləndirmə
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log(`İstifadəçi auth olundu, "${from}" səhifəsinə yönləndirilir`);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

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
      <LoginBackgroundDecorations />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel rounded-lg w-full max-w-md p-8 shadow-xl"
      >
        <LoginHeader />
        <LoginForm 
          directLoginError={directLoginError} 
          setDirectLoginError={setDirectLoginError} 
        />
        <LoginCredentials />
      </motion.div>
    </div>
  );
};

export default Login;
