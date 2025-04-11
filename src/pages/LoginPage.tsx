
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import LoginForm from '@/components/auth/LoginForm';
import LoginContainer from '@/components/auth/LoginContainer';
import BackgroundDecorations from '@/components/auth/BackgroundDecorations';
import LoginHeader from '@/components/auth/LoginHeader';
import { Helmet } from 'react-helmet';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, error, clearError } = useAuth();

  // İstifadəçi autentifikasiya olunubsa, onu dashboard-a yönləndir
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" />;
  }

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
            <LoginForm error={error} clearError={clearError} />
          </LoginContainer>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
