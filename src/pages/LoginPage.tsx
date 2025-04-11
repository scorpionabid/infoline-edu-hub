
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import BackgroundDecorations from '@/components/auth/BackgroundDecorations';
import LoginHeader from '@/components/auth/LoginHeader';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, error, clearError, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // İstifadəçi autentifikasiya olunubsa, onu dashboard-a yönləndir
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      const success = await login(email, password);
      
      if (success) {
        toast.success('Uğurla daxil oldunuz');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Giriş zamanı xəta:', err);
      toast.error('Giriş zamanı xəta baş verdi', {
        description: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Giriş | InfoLine</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <BackgroundDecorations />
        <div className="flex-1 flex items-center justify-center">
          <LoginContainer>
            <LoginHeader />
            <LoginForm 
              error={error} 
              clearError={clearError} 
              onSubmit={handleLogin} 
              isSubmitting={isSubmitting}
            />
          </LoginContainer>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
