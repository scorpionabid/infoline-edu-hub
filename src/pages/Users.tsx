
import React, { useState, useCallback, useEffect } from 'react';
import UserList from '@/components/users/UserList';
import UserHeader from '@/components/users/UserHeader';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useUserList } from '@/hooks/user/useUserList';
import { User, UserRole, UserFilter as UserFilterType, UserStatus } from '@/types/user';
import { toast } from 'sonner';

// Using UserFilterType from types/user

const Users = () => {
  const { t } = useLanguage();
  const { isRegionAdmin, isSuperAdmin, isSectorAdmin, sectorId, regionId } = usePermissions();
  const isAuthorized = isSuperAdmin || isRegionAdmin || isSectorAdmin;
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();
  
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

  // State for filters and pagination
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Local filter state that matches the UserFilterType but with string for role/status
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '' as string,
    regionId: isRegionAdmin && regionId ? regionId : '',
    sectorId: isSectorAdmin && sectorId ? sectorId : '',
    schoolId: ''
  });

  // Prepare filters for the useUserList hook
  const listFilters: UserFilterType = {
    ...filters,
    role: filters.role ? [filters.role as UserRole] : [],
    status: filters.status ? [filters.status as UserStatus] : []
  };

  // Fetch users with filters and pagination
  const { 
    users = [], 
    loading, 
    error, 
    totalCount,
    refreshUsers 
  } = useUserList(listFilters);
  
  // Handle user added/edited
  const handleUserAddedOrEdited = useCallback(() => {
    refreshUsers();
    setRefreshTrigger(prev => prev + 1);
  }, [refreshUsers]);
  
  const totalPages = Math.ceil((totalCount || 0) / pageSize);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Xəta baş verdi: İstifadəçilər yüklənərkən xəta baş verdi');
    }
  }, [error]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    // Reset to first page when filters change
    setCurrentPage(1);
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optional: Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



  return (
    <>
      <Helmet>
        <title>{t('users')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <UserHeader 
          entityTypes={entityTypes}
          currentFilter={filters}
          onFilterChange={handleFilterChange}
          onUserAddedOrEdited={handleUserAddedOrEdited}
          onAddUser={() => {
            // TODO: Implement add user modal or navigation
            console.log('Add user clicked');
          }}
        />

        <UserList 
          users={users}
          isLoading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEditUser={(user: User) => {
            // TODO: Implement edit user functionality
            console.log('Edit user:', user);
          }}
          onDeleteUser={(user: User) => {
            // TODO: Implement delete user functionality
            console.log('Delete user:', user);
          }}
          onSearch={(query: string) => {
            handleFilterChange({ search: query });
          }}
        />
      </div>
    </>
  );
};

export default Users;
