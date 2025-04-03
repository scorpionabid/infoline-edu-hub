
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useSupabaseAuth';
import LoginForm from '@/components/auth/LoginForm';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginBackgroundDecorations from '@/components/auth/LoginBackgroundDecorations';
import LoginCredentials from '@/components/auth/LoginCredentials';

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [directLoginError, setDirectLoginError] = useState<string | null>(null);
  
  // Daxil olmuş istifadəçini yönləndirmə
  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log(`İstifadəçi auth olundu, "${from}" səhifəsinə yönləndirilir`);
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  // Yüklənmə zamanı göstəriləcək
  if (loading) {
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
