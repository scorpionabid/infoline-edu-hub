
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoginForm from '@/components/auth/LoginForm';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginContainer from '@/components/auth/LoginContainer';
import BackgroundDecorations from '@/components/auth/BackgroundDecorations';
import { useAuth } from '@/context/auth/useAuth';
import { useLanguage } from '@/context/LanguageContext';

const Login: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'schooladmin') {
        navigate('/school-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <>
      <Helmet>
        <title>{t('login')} | InfoLine</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <BackgroundDecorations />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <LoginContainer>
            <LoginHeader />
            <LoginForm />
          </LoginContainer>
        </div>
      </div>
    </>
  );
};

export default Login;
