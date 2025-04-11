
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useAuth, useRole } from '@/context/auth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';

const UsersPage: React.FC = () => {
  const { t } = useLanguage();
  const isSuperOrRegionAdmin = useRole(['superadmin', 'regionadmin']);
  const isSuperAdmin = useRole('superadmin');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // User listini yeniləmək üçün state
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Redirect if not allowed to access this page
  React.useEffect(() => {
    if (!isSuperOrRegionAdmin) {
      navigate('/dashboard');
    }
  }, [isSuperOrRegionAdmin, navigate]);

  if (!isSuperOrRegionAdmin) {
    return null;
  }

  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('users')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">{t('users')}</h1>
        <p className="text-muted-foreground">{t('usersPageDescription')}</p>
      </div>
    </SidebarLayout>
  );
};

export default UsersPage;
