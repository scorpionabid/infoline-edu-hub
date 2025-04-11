
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import UserList from '@/components/users/UserList';
import UserHeader from '@/components/users/UserHeader';
import { useAuth, useRole } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';
import { Role } from '@/context/auth/types';

const Users = () => {
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

  // SuperAdmin bütün entity növlərinə çıxışı var, RegionAdmin yalnız sektor və məktəblərə
  const entityTypes: Array<'region' | 'sector' | 'school'> = isSuperAdmin 
    ? ['region', 'sector', 'school'] 
    : ['sector', 'school'];

  // İstifadəçi əlavə edildikdə, yenilənməni işə sal
  const handleUserAddedOrEdited = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // user.role tipini Role tipinə çeviririk
  const userRole = user?.role as Role | undefined;

  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('usersManagement')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <UserHeader 
          entityTypes={entityTypes} 
          onUserAddedOrEdited={handleUserAddedOrEdited}
        />
        <UserList 
          currentUserRole={userRole} 
          currentUserRegionId={user?.regionId}
          onUserAddedOrEdited={handleUserAddedOrEdited}
        />
      </div>
    </SidebarLayout>
  );
};

export default Users;
