
import { useState, useCallback, useEffect } from 'react';
import { getUsers, deleteUser, updateUser, createUser } from '@/services/user';
import { UserRole, CreateUserData, UpdateUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export interface UserFilter {
  role?: UserRole;
  status?: string;
  region?: string;
  sector?: string;
  school?: string;
  search?: string;
}

export const useUserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<FullUserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [operationComplete, setOperationComplete] = useState(false);

  // İstifadəçiləri əldə etmə
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Hazırkı istifadəçinin regionuna görə filtirləyin
      let regionFilter = filter.region;
      if (currentUser?.role === 'regionadmin' && currentUser?.region_id) {
        regionFilter = currentUser.region_id;
      }
      
      const response = await getUsers(
        {
          role: filter.role as UserRole | undefined,
          region_id: regionFilter,
          sector_id: filter.sector,
          school_id: filter.school,
          status: filter.status,
          search: filter.search,
        },
        {
          page: currentPage,
          pageSize,
        }
      );
      
      setUsers(response.data);
      setTotalCount(response.count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
      toast.error('İstifadəçilər yüklənərkən xəta baş verdi', {
        description: err instanceof Error ? err.message : 'Bilinməyən xəta'
      });
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, pageSize, currentUser]);

  // Filtr dəyişdikdə istifadəçiləri yenidən əldə etmə
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // İstifadəçini redaktə etmə
  const handleEditUser = useCallback((user: FullUserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }, []);

  // İstifadəçini silmə
  const handleDeleteUser = useCallback((user: FullUserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }, []);

  // İstifadəçi təfərrüatlarını göstərmə
  const handleViewDetails = useCallback((user: FullUserData) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  }, []);

  // İstifadəçi redaktəsini təsdiqləmə
  const handleUpdateUserConfirm = useCallback(async (updatedUserData: UpdateUserData) => {
    if (!selectedUser) return;
    
    try {
      const updatedUser = await updateUser(selectedUser.id, updatedUserData);
      
      if (updatedUser) {
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === selectedUser.id ? updatedUser : user
        ));
        setIsEditDialogOpen(false);
        setOperationComplete(true);
      }
    } catch (err) {
      console.error('İstifadəçi yeniləmə xətası:', err);
    }
  }, [selectedUser]);

  // İstifadəçi silməni təsdiqləmə
  const handleDeleteUserConfirm = useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      const success = await deleteUser(selectedUser.id);
      
      if (success) {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
        setIsDeleteDialogOpen(false);
        setOperationComplete(true);
      }
    } catch (err) {
      console.error('İstifadəçi silmə xətası:', err);
    }
  }, [selectedUser]);

  // Yeni istifadəçi yaratma
  const handleCreateUser = useCallback(async (userData: CreateUserData) => {
    try {
      const newUser = await createUser(userData);
      
      if (newUser) {
        setUsers(prevUsers => [...prevUsers, newUser]);
        setOperationComplete(true);
        return newUser;
      }
      return null;
    } catch (err) {
      console.error('İstifadəçi yaratma xətası:', err);
      return null;
    }
  }, []);

  // Filtri yeniləmə
  const updateFilter = useCallback((newFilter: Partial<UserFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(1);
  }, []);

  // Filtri sıfırlama
  const resetFilter = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  // Səhifə dəyişikliyi
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Əməliyyat tamamlandıqda məlumatları yenidən yükləmə
  useEffect(() => {
    if (operationComplete) {
      fetchUsers();
      setOperationComplete(false);
    }
  }, [operationComplete, fetchUsers]);

  return {
    users,
    totalCount,
    loading,
    error,
    filter,
    currentPage,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
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
    handleCreateUser,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailsDialogOpen,
    fetchUsers,
  };
};
