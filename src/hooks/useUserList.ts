
import { useState, useEffect, useCallback } from 'react';
import { FullUserData } from '@/types/supabase';
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
  } = useUserFetch(filter, currentPage, pageSize);
  
  // İlk yükləmə zamanı istifadəçiləri əldə edirik
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Hər hansı əməliyyat tamamlandıqda siyahını yeniləyirik
  useEffect(() => {
    if (operationComplete) {
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
