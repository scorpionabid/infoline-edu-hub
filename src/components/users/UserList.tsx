
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { FullUserData, User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from 'date-fns';
import UserFilters from './UserFilters';
import UserDetailsDialog from './UserDetailsDialog';
import EditUserDialog from './EditUserDialog';
import { UserFilter, FilterOption } from './UserSelectParts/types';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface UserListProps {
  onCreateUser?: () => void;
}

const UserList: React.FC<UserListProps> = ({ onCreateUser }) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const { isSuperAdmin, isRegionAdmin } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<FullUserData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [filter, setFilter] = useState<UserFilter>({
    role: [],
    status: [],
    search: '',
    page: 1,
    limit: 50
  });
  
  // Rol və status seçimləri üçün sabit dəyərlər
  const roleOptions: FilterOption[] = [
    { value: 'superadmin', label: t('superadmin') },
    { value: 'regionadmin', label: t('regionadmin') },
    { value: 'sectoradmin', label: t('sectoradmin') },
    { value: 'schooladmin', label: t('schooladmin') },
    { value: 'user', label: t('user') }
  ];
  
  const statusOptions: FilterOption[] = [
    { value: 'active', label: t('active') },
    { value: 'inactive', label: t('inactive') },
    { value: 'blocked', label: t('blocked') },
    { value: 'pending', label: t('pending') }
  ];
  
  // İstifadəçi siyahısını yüklə
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      let query = supabase.rpc('get_full_user_data');
      
      // Filtrlər
      if (filter.role && filter.role.length > 0) {
        query = query.in('role', filter.role);
      }
      
      if (filter.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }
      
      if (filter.region_id) {
        query = query.eq('region_id', filter.region_id);
      }
      
      if (filter.sector_id) {
        query = query.eq('sector_id', filter.sector_id);
      }
      
      if (filter.search) {
        query = query.or(`email.ilike.%${filter.search}%, full_name.ilike.%${filter.search}%`);
      }
      
      // Sıralama və limit
      query = query.order('created_at', { ascending: false })
        .range((filter.page - 1) * filter.limit, filter.page * filter.limit - 1);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setUsers(data?.map(user => ({
        ...user,
        // Əgər name yoxdursa, full_name'i istifadə edək
        name: user.full_name,
        // type çevirmələri üçün alias-lar əlavə edək
        regionId: user.region_id,
        sectorId: user.sector_id,
        schoolId: user.school_id,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastLogin: user.last_login,
        // notificationSettings objectini əlavə edək
        notificationSettings: {
          email: true,
          inApp: true,
          push: true,
          system: true,
          deadline: true
        }
      })) || []);
      
    } catch (err: any) {
      console.error('Error loading users:', err);
      toast.error(t('errorLoadingUsers'), {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // İlkin yüklənmə və filter dəyişikliyi
  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // İstifadəçi detallarını göstər
  const handleViewDetails = (user: FullUserData) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };
  
  // İstifadəçini redaktə et
  const handleEditUser = (user: FullUserData) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };
  
  // İstifadəçi statusunu dəyişmək
  const handleToggleStatus = async (user: Partial<User>) => {
    if (!user.id || !user.status) return;
    
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Müvəffəqiyyətli mesaj göstər
      const successMessage = newStatus === 'active' ? t('userActivated') : t('userDeactivated');
      toast.success(successMessage);
      
      // İstifadəçi siyahısını yenilə
      loadUsers();
      
    } catch (err: any) {
      console.error('Error updating user status:', err);
      toast.error(t('errorUpdatingUserStatus'), {
        description: err.message
      });
    }
  };
  
  // Format tarixi
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };
  
  // Status badge
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">{t('active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('inactive')}</Badge>;
      case 'blocked':
        return <Badge variant="destructive">{t('blocked')}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{t('pending')}</Badge>;
      default:
        return <Badge variant="outline">{status || t('unknown')}</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">{t('userManagement')}</h2>
        {(isSuperAdmin || isRegionAdmin) && (
          <Button onClick={onCreateUser}>
            {t('createUser')}
          </Button>
        )}
      </div>
      
      <UserFilters 
        filter={filter}
        setFilter={setFilter}
        roleOptions={roleOptions}
        statusOptions={statusOptions}
        onSearch={loadUsers}
      />
      
      <div className="border rounded-md">
        <Table>
          <TableCaption>
            {isLoading ? t('loading') : t('userListCaption')}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('lastLogin')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || user.name || t('noName')}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{t(String(user.role).toLowerCase())}</TableCell>
                <TableCell>{renderStatusBadge(user.status)}</TableCell>
                <TableCell>{formatDate(user.last_login || user.lastLogin)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(user)}
                  >
                    {t('view')}
                  </Button>
                  {(isSuperAdmin || (isRegionAdmin && user.region_id === currentUser?.region_id)) && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        {t('edit')}
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button 
                          variant={user.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(user as User)}
                        >
                          {user.status === 'active' ? t('deactivate') : t('activate')}
                        </Button>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t('noUsersFound')}
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* İstifadəçi Detalları Dialoqu */}
      {selectedUser && (
        <UserDetailsDialog 
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          user={selectedUser}
          onEditClick={() => {
            setIsDetailsOpen(false);
            setIsEditOpen(true);
          }}
        />
      )}
      
      {/* İstifadəçi Düzəliş Dialoqu */}
      {selectedUser && (
        <EditUserDialog 
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onComplete={() => {
            setIsEditOpen(false);
            loadUsers();
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default UserList;
