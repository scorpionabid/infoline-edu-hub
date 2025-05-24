
import React, { useState, useCallback } from 'react';
import UserList from '@/components/users/UserList';
import UserHeader from '@/components/users/UserHeader';
import { useAuth } from '@/context/auth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { UserFilter } from '@/hooks/user/useUserList';

const Users = () => {
  const { t } = useLanguage();
  const { isRegionAdmin, isSuperAdmin, isSectorAdmin, sectorId, regionId } = usePermissions();
  const isAuthorized = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // User list refresh trigger state - incrementing this will refresh the list
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Redirect if not allowed to access this page
  React.useEffect(() => {
    if (!isAuthorized) {
      navigate('/dashboard');
    }
  }, [isAuthorized, navigate]);

  if (!isAuthorized) {
    return null;
  }

  // SuperAdmin has access to all entity types, RegionAdmin only to sectors and schools, SectorAdmin only to schools
  const entityTypes: Array<'region' | 'sector' | 'school'> = 
    isSuperAdmin 
      ? ['region', 'sector', 'school'] 
      : isRegionAdmin 
        ? ['sector', 'school'] 
        : ['school'];

  // Refresh user list when a user is added or edited
  const handleUserAddedOrEdited = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Filter parameters for sector and region admins - ensure all fields are initialized
  const filterParams: UserFilter = {
    search: '',
    role: '',
    status: '',
    regionId: isRegionAdmin && regionId ? regionId : '',
    sectorId: isSectorAdmin && sectorId ? sectorId : '',
    schoolId: ''
  };

  return (
    <>
      <Helmet>
        <title>{t('users')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <UserHeader 
          entityTypes={entityTypes} 
          onUserAddedOrEdited={handleUserAddedOrEdited} 
        />

        <UserList 
          refreshTrigger={refreshTrigger} 
          filterParams={filterParams}
        />
      </div>
    </>
  );
};

export default Users;
