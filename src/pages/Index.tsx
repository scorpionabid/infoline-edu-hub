
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';
import LoadingScreen from '@/components/auth/LoadingScreen';

const Index: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (user?.role === 'schooladmin') {
        navigate('/school-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  return <LoadingScreen />;
};

export default Index;
