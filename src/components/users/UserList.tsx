
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useUserList } from '@/hooks/useUserList';
import { Role } from '@/context/AuthContext';
import { Pagination } from '@/components/ui/pagination';
import EditUserDialog from './EditUserDialog';
import DeleteUserDialog from './DeleteUserDialog';
import UserDetailsDialog from './UserDetailsDialog';
import UserListTable from './UserListTable';
import UserFilters from './UserFilters';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { User, userToFullUserData } from '@/types/user';
import { FullUserData } from '@/types/supabase';

interface UserListProps {
  currentUserRole?: Role;
  currentUserRegionId?: string;
  onUserAddedOrEdited?: () => void;
}

const UserList: React.FC<UserListProps> = ({ 
  currentUserRole,
  currentUserRegionId,
  onUserAddedOrEdited
}) => {
  const { t } = useLanguage();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const {
    users,
    totalCount,
    loading,
    error,
    filter,
    currentPage,
    pageSize,
    totalPages,
    selectedUser,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isDetailsDialogOpen,
    updateFilter,
    resetFilter,
    handlePageChange,
    handleEditUser,
    handleDeleteUser,
    handleViewDetails,
    handleUpdateUserConfirm,
    handleDeleteUserConfirm,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailsDialogOpen,
    fetchUsers
  } = useUserList();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);

  useEffect(() => {
    if (onUserAddedOrEdited) {
      const handleUserChange = () => {
        setRefreshTrigger(prev => prev + 1);
      };
      
      window.addEventListener('user-added-or-edited', handleUserChange);
      
      return () => {
        window.removeEventListener('user-added-or-edited', handleUserChange);
      };
    }
  }, [onUserAddedOrEdited]);

  const handleUserUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    
    if (onUserAddedOrEdited) {
      onUserAddedOrEdited();
    }
  };

  const renderUserRow = (user: any) => {
    return (
      <tr key={user.id}>
        <td>{user.name || user.full_name}</td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <td>{user.regionId || user.region_id}</td>
      </tr>
    );
  };

  if (error) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <div className="flex justify-center items-center text-destructive mb-4">
          <span className="text-xl">⚠️</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">{t('errorOccurred')}</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button 
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          onClick={() => setRefreshTrigger(prev => prev + 1)}
        >
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserFilters 
        filter={filter} 
        updateFilter={updateFilter} 
        resetFilter={resetFilter}
        currentUserRole={currentUserRole}
        currentUserRegionId={currentUserRegionId}
      />
      
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <UserListTable 
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onViewDetails={handleViewDetails}
            currentUserRole={currentUserRole}
            renderRow={renderUserRow}
          />
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                previousLabel={t('previous')}
                nextLabel={t('next')}
                pageLabel={(page) => `${page} ${t('of')} ${totalPages}`}
              />
            </div>
          )}
        </>
      )}
      
      {selectedUser && (
        <>
          <EditUserDialog 
            open={isEditDialogOpen} 
            onOpenChange={setIsEditDialogOpen}
            user={selectedUser as unknown as User}
            onSave={(updatedUser) => {
              // User tipini FullUserData-ya çeviririk
              const fullData = userToFullUserData(updatedUser);
              handleUpdateUserConfirm(fullData);
              handleUserUpdated();
            }}
          />
          
          <DeleteUserDialog 
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            user={selectedUser as unknown as User}
            onDelete={() => {
              handleDeleteUserConfirm();
              handleUserUpdated();
            }}
          />
          
          <UserDetailsDialog 
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            user={selectedUser as unknown as User}
          />
        </>
      )}
    </div>
  );
};

export default UserList;
