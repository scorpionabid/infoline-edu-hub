
import React from 'react';
import { Helmet } from 'react-helmet';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import { UserList } from '@/components/users/UserList';

/**
 * İstifadəçilər Səhifəsi
 */
const Users = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('users')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <UserList />
        </div>
      </SidebarLayout>
    </>
  );
};

export default Users;
