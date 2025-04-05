
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';
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
      let query = supabase
        .from('user_roles')
        .select(`
          *,
          profiles(*)
        `, { count: 'exact' });
      
      // Filtrləri tətbiq et
      if (filter.role) {
        query = query.eq('role', filter.role);
      }
      
      // Hazırkı istifadəçinin regionuna görə filtirləyin
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
      
      // Pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      if (!data) {
        setUsers([]);
        setTotalCount(0);
        return;
      }
      
      // Status və axtarış filtrini profiles üzərində əlavə edirik
      let filteredData = data;
      if (filter.status || filter.search) {
        filteredData = data.filter(item => {
          const profile = item.profiles;
          
          // Status filtri
          if (filter.status && profile?.status !== filter.status) {
            return false;
          }
          
          // Axtarış filtri
          if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            const fullName = profile?.full_name?.toLowerCase() || '';
            const email = profile?.email?.toLowerCase() || '';
            
            if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
              return false;
            }
          }
          
          return true;
        });
      }
      
      // İstifadəçi məlumatlarını əldə etmək
      const userIds = filteredData.map(item => item.user_id);
      const { data: emailsData } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
      
      const emailMap: Record<string, string> = {};
      if (emailsData) {
        emailsData.forEach((item: { id: string, email: string }) => {
          emailMap[item.id] = item.email;
        });
      }
      
      // Admin entity məlumatlarını əldə et
      const adminEntityPromises = filteredData.map(async (item) => {
        if (!item.role.includes('admin') || 
           (item.role === 'regionadmin' && !item.region_id) ||
           (item.role === 'sectoradmin' && !item.sector_id) || 
           (item.role === 'schooladmin' && !item.school_id)) {
          return null;
        }
        
        try {
          let adminEntity: any = null;
          
          if (item.role === 'regionadmin' && item.region_id) {
            const { data: regionData } = await supabase
              .from('regions')
              .select('name, status')
              .eq('id', item.region_id)
              .single();
            
            if (regionData) {
              adminEntity = {
                type: 'region',
                name: regionData.name,
                status: regionData.status
              };
            }
          } else if (item.role === 'sectoradmin' && item.sector_id) {
            const { data: sectorData } = await supabase
              .from('sectors')
              .select('name, status, regions(name)')
              .eq('id', item.sector_id)
              .single();
            
            if (sectorData) {
              adminEntity = {
                type: 'sector',
                name: sectorData.name,
                status: sectorData.status,
                regionName: sectorData.regions?.name
              };
            }
          } else if (item.role === 'schooladmin' && item.school_id) {
            const { data: schoolData } = await supabase
              .from('schools')
              .select('name, status, type, sectors(name), regions(name)')
              .eq('id', item.school_id)
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
      
      // Tam istifadəçi məlumatlarını formatlaşdır
      const formattedUsers: FullUserData[] = filteredData.map((item, index) => {
        const profile = item.profiles || {};
        
        // Status dəyərini düzgün tipə çevirək
        const statusValue = profile.status || 'active';
        const typedStatus = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
          ? statusValue as 'active' | 'inactive' | 'blocked'
          : 'active' as 'active' | 'inactive' | 'blocked';
        
        return {
          id: item.user_id,
          email: emailMap[item.user_id] || profile.email || 'N/A',
          full_name: profile.full_name || 'İsimsiz İstifadəçi',
          role: item.role,
          region_id: item.region_id,
          sector_id: item.sector_id,
          school_id: item.school_id,
          phone: profile.phone,
          position: profile.position,
          language: profile.language || 'az',
          avatar: profile.avatar,
          status: typedStatus,
          last_login: profile.last_login,
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || '',
          
          // Alias-lar
          name: profile.full_name || 'İsimsiz İstifadəçi',
          regionId: item.region_id,
          sectorId: item.sector_id,
          schoolId: item.school_id,
          lastLogin: profile.last_login,
          createdAt: profile.created_at || '',
          updatedAt: profile.updated_at || '',
          
          // Admin entity
          adminEntity: adminEntities[index],
          
          // Əlavə xüsusiyyətlər
          twoFactorEnabled: false,
          notificationSettings: {
            email: true,
            system: true
          }
        };
      });
      
      setUsers(formattedUsers);
      setTotalCount(count || filteredData.length);
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
      toast.error('İstifadəçilər yüklənərkən xəta baş verdi');
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
  const handleUpdateUserConfirm = useCallback(async (updatedUserData: FullUserData) => {
    if (!selectedUser) return;
    
    try {
      // Profil məlumatlarını yenilə
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
      
      // Rol məlumatlarını yenilə
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          role: updatedUserData.role,
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
  }, [selectedUser]);

  // İstifadəçi silməni təsdiqləmə
  const handleDeleteUserConfirm = useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      // İstifadəçi profilini sil, user_roles CASCADE ilə silinəcək
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
  }, [selectedUser]);

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

  // t funksiyasını yaratmaq
  const t = (key: string) => {
    // Bu sadəcə misal üçündür, əslində useLanguage hook-undan istifadə edilməlidir
    const translations: Record<string, string> = {
      'userUpdated': 'İstifadəçi məlumatları yeniləndi',
      'userDeleted': 'İstifadəçi silindi',
      'loading': 'Yüklənir...',
      'noUsersFound': 'İstifadəçi tapılmadı'
    };
    
    return translations[key] || key;
  };

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
