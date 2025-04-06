import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Role } from '@/context/AuthContext';

export interface UserFilter {
  role?: string;
  status?: string;
  region?: string;
  sector?: string;
  school?: string;
  search?: string;
}

export const useUserList = () => {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('user_roles')
        .select('*', { count: 'exact' });
      
      if (filter.role) {
        // filtr dəyərini string kimi ötür
        query = query.eq('role', filter.role);
      }
      
      if (currentUser?.role === 'regionadmin' && currentUser?.regionId) {
        query = query.eq('region_id', currentUser.regionId);
      } else if (filter.region) {
        query = query.eq('region_id', filter.region);
      }
      
      if (filter.sector) {
        query = query.eq('sector_id', filter.sector);
      }
      
      if (filter.school) {
        query = query.eq('school_id', filter.school);
      }
      
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data: rolesData, error: rolesError, count } = await query;
      
      if (rolesError) throw rolesError;
      
      if (!rolesData || rolesData.length === 0) {
        setUsers([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      
      const userIds = rolesData.map(item => item.user_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
      
      const { data: emailsData } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
      
      const emailMap: Record<string, string> = {};
      if (emailsData) {
        emailsData.forEach((item: { id: string, email: string }) => {
          emailMap[item.id] = item.email;
        });
      }
      
      let filteredRolesData = rolesData;
      if (filter.status || filter.search) {
        filteredRolesData = rolesData.filter(roleItem => {
          const profile = profilesMap[roleItem.user_id] || {};
          
          if (filter.status && profile.status !== filter.status) {
            return false;
          }
          
          if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            const fullName = (profile.full_name || '').toLowerCase();
            const email = (emailMap[roleItem.user_id] || '').toLowerCase();
            
            if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
              return false;
            }
          }
          
          return true;
        });
      }
      
      const adminEntityPromises = filteredRolesData.map(async (roleItem) => {
        // Admin rolları üçün əlavə məlumatları əldə et
        const rolStr = String(roleItem.role);
        if (!rolStr.includes('admin') || 
           (rolStr === 'regionadmin' && !roleItem.region_id) ||
           (rolStr === 'sectoradmin' && !roleItem.sector_id) || 
           (rolStr === 'schooladmin' && !roleItem.school_id)) {
          return null;
        }
        
        try {
          let adminEntity: any = null;
          
          if (rolStr === 'regionadmin' && roleItem.region_id) {
            const { data: regionData } = await supabase
              .from('regions')
              .select('name, status')
              .eq('id', roleItem.region_id)
              .single();
            
            if (regionData) {
              adminEntity = {
                type: 'region',
                name: regionData.name,
                status: regionData.status
              };
            }
          } else if (rolStr === 'sectoradmin' && roleItem.sector_id) {
            const { data: sectorData } = await supabase
              .from('sectors')
              .select('name, status, regions(name)')
              .eq('id', roleItem.sector_id)
              .single();
            
            if (sectorData) {
              adminEntity = {
                type: 'sector',
                name: sectorData.name,
                status: sectorData.status,
                regionName: sectorData.regions?.name
              };
            }
          } else if (rolStr === 'schooladmin' && roleItem.school_id) {
            const { data: schoolData } = await supabase
              .from('schools')
              .select('name, status, type, sectors(name), regions(name)')
              .eq('id', roleItem.school_id)
              .single();
            
            if (schoolData) {
              adminEntity = {
                type: 'school',
                name: schoolData.name,
                status: schoolData.status,
                schoolType: schoolData.type,
                sectorName: schoolData.sectors?.name,
                regionName: schoolData.regions?.name
              };
            }
          }
          
          return adminEntity;
        } catch (err) {
          console.error('Admin entity məlumatları əldə edilərkən xəta:', err);
          return null;
        }
      });
      
      const adminEntities = await Promise.all(adminEntityPromises);
      
      const formattedUsers: FullUserData[] = filteredRolesData.map((roleItem, index) => {
        const profile = profilesMap[roleItem.user_id] || {};
        
        let typedStatus: 'active' | 'inactive' | 'blocked' = 'active';
        const statusValue = profile.status || 'active';
        
        if (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') {
          typedStatus = statusValue as 'active' | 'inactive' | 'blocked';
        }
        
        // Rolu UserRole tipinə məcburi çeviririk
        const roleValue = roleItem.role as unknown as UserRole;
        
        return {
          id: roleItem.user_id,
          email: emailMap[roleItem.user_id] || 'N/A',
          full_name: profile.full_name || 'İsimsiz İstifadəçi',
          role: roleValue,
          region_id: roleItem.region_id,
          sector_id: roleItem.sector_id,
          school_id: roleItem.school_id,
          phone: profile.phone,
          position: profile.position,
          language: profile.language || 'az',
          avatar: profile.avatar,
          status: typedStatus,
          last_login: profile.last_login,
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || '',
          
          name: profile.full_name || 'İsimsiz İstifadəçi',
          regionId: roleItem.region_id,
          sectorId: roleItem.sector_id,
          schoolId: roleItem.school_id,
          lastLogin: profile.last_login,
          createdAt: profile.created_at || '',
          updatedAt: profile.updated_at || '',
          
          adminEntity: adminEntities[index],
          
          twoFactorEnabled: false,
          notificationSettings: {
            email: true,
            system: true
          }
        };
      });
      
      setUsers(formattedUsers);
      setTotalCount(count || filteredRolesData.length);
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
      toast.error('İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, pageSize, currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = useCallback((user: FullUserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteUser = useCallback((user: FullUserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((user: FullUserData) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleUpdateUserConfirm = useCallback(async (updatedUserData: FullUserData) => {
    if (!selectedUser) return;
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updatedUserData.full_name,
          phone: updatedUserData.phone,
          position: updatedUserData.position,
          language: updatedUserData.language,
          avatar: updatedUserData.avatar,
          status: updatedUserData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);
      
      if (profileError) throw profileError;
      
      // role dəyərini çeviririk
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          role: updatedUserData.role as any, // `as any` ilə tipi keçirik
          region_id: updatedUserData.region_id,
          sector_id: updatedUserData.sector_id,
          school_id: updatedUserData.school_id,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', selectedUser.id);
      
      if (roleError) throw roleError;
      
      toast.success(t('userUpdated'));
      setIsEditDialogOpen(false);
      setOperationComplete(true);
    } catch (err) {
      console.error('İstifadəçi yeniləmə xətası:', err);
      toast.error('İstifadəçi məlumatları yenilənərkən xəta baş verdi');
    }
  }, [selectedUser, t]);

  const handleDeleteUserConfirm = useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      toast.success(t('userDeleted'));
      setIsDeleteDialogOpen(false);
      setOperationComplete(true);
    } catch (err) {
      console.error('İstifadəçi silmə xətası:', err);
      toast.error('İstifadəçi silinərkən xəta baş verdi');
    }
  }, [selectedUser, t]);

  const updateFilter = useCallback((newFilter: Partial<UserFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(1);
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsDetailsDialogOpen,
    fetchUsers,
  };
};
