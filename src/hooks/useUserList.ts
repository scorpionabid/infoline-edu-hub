
import { useState, useEffect, useCallback } from 'react';
import { FullUserData } from '@/types/user';
import { useUserFilters } from './user/useUserFilters';
import { useUserPagination } from './user/useUserPagination';
import { useUserOperations } from './user/useUserOperations';
import { useUserFetch } from './user/useUserFetch';

export interface UserFilter {
  role?: string;
  status?: string;
  region?: string;
  sector?: string;
  school?: string;
  search?: string;
}

export const useUserList = () => {
  const [operationComplete, setOperationComplete] = useState(false);
  
  // Alt hook-ları birləşdiririk
  const { filter, updateFilter, resetFilter } = useUserFilters();
  const { currentPage, pageSize, totalCount, handlePageChange, getTotalPages, setTotalCount } = useUserPagination();
  
  const handleOperationComplete = useCallback(() => {
    setOperationComplete(true);
  }, []);
  
  const {
    selectedUser,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isDetailsDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailsDialogOpen,
    handleEditUser,
    handleDeleteUser,
    handleViewDetails,
    handleUpdateUserConfirm,
    handleDeleteUserConfirm
  } = useUserOperations(handleOperationComplete);
  
  const {
    users,
    loading,
    error,
    fetchUsers,
    setUsers,
    totalCount: fetchedCount,
    setTotalCount: setFetchedCount
  } = useUserFetch(filter, currentPage, pageSize);
  
  // Total count-u useUserFetch-dən alırıq
  useEffect(() => {
    if (fetchedCount !== undefined) {
      setTotalCount(fetchedCount);
    }
  }, [fetchedCount, setTotalCount]);
  
  // İlk yükləmə zamanı istifadəçiləri əldə edirik
  useEffect(() => {
    console.log('Initial fetch of users');
    fetchUsers();
  }, [fetchUsers]);
  
  // Hər hansı əməliyyat tamamlandıqda siyahını yeniləyirik
  useEffect(() => {
    if (operationComplete) {
      console.log('Operation completed, refreshing users');
      fetchUsers();
      setOperationComplete(false);
    }
  }, [operationComplete, fetchUsers]);

  return {
    // Filtrlə bağlı
    filter,
    updateFilter,
    resetFilter,
    
    // Səhifələmə ilə bağlı
    currentPage,
    pageSize,
    totalCount,
    totalPages: getTotalPages(),
    handlePageChange,
    
    // Verilənlərlə bağlı
    users,
    loading,
    error,
    fetchUsers,
    
    // İstifadəçi əməliyyatları ilə bağlı
    selectedUser,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isDetailsDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailsDialogOpen,
    handleEditUser,
    handleDeleteUser,
    handleViewDetails,
    handleUpdateUserConfirm,
    handleDeleteUserConfirm,
  };
};
