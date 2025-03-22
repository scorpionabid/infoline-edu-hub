
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import UserList from '@/components/users/UserList';
import UserHeader from '@/components/users/UserHeader';
import { useAuth, useRole } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const Users = () => {
  const { t } = useLanguage();
  const isSuperOrRegionAdmin = useRole(['superadmin', 'regionadmin']);
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
      <div className="container mx-auto py-6 space-y-6">
        <UserHeader entityTypes={['region', 'sector', 'school']} />
        <UserList currentUserRole={user?.role} currentUserRegionId={user?.regionId} />
      </div>
    </SidebarLayout>
  );
};

export default Users;
