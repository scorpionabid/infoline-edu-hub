import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { UserFilter, UserWithAssignments, UserStatus } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/utils/dateUtils';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import EditUserDialog from './EditUserDialog';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ensureValidStatus, ensureValidRole } from '@/utils/buildFixes';

interface UserListTableProps {
  refreshTrigger: number;
  filterParams: UserFilter;
}

const UserListTable: React.FC<UserListTableProps> = ({ refreshTrigger, filterParams }) => {
  const [users, setUsers] = useState<UserWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithAssignments | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger, filterParams]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          position,
          status,
          language,
          avatar,
          last_login,
          created_at,
          updated_at,
          user_roles!inner(
            role, 
            region_id, 
            sector_id, 
            school_id,
            regions:region_id(name),
            sectors:sector_id(name), 
            schools:school_id(name)
          )
        `);

      // Apply filters
      if (filterParams.search) {
        query = query.or(`full_name.ilike.%${filterParams.search}%,email.ilike.%${filterParams.search}%`);
      }

      if (filterParams.status) {
        query = query.eq('status', filterParams.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data safely
      const transformedData: UserWithAssignments[] = (data || []).map(user => {
        const userRole = Array.isArray(user.user_roles) ? user.user_roles[0] : user.user_roles || {};
        
        return {
          id: user.id,
          full_name: user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
          position: user.position || '',
          role: ensureValidRole(userRole?.role),
          status: ensureValidStatus(user.status) as UserStatus,
          region_id: userRole?.region_id || '',
          sector_id: userRole?.sector_id || '',
          school_id: userRole?.school_id || '',
          language: user.language || 'az',
          created_at: user.created_at || '',
          updated_at: user.updated_at || '',
          last_login: user.last_login || '',
          avatar: user.avatar || '',
          region: userRole?.regions?.name || '',
          sector: userRole?.sectors?.name || '',
          school: userRole?.schools?.name || '',
        };
      });

      setUsers(transformedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('errorFetchingUsers') || 'İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserWithAssignments) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: UserWithAssignments) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: selectedUser.id }
      });

      if (error) throw error;

      toast.success(t('userDeletedSuccessfully') || 'İstifadəçi uğurla silindi');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('errorDeletingUser') || 'İstifadəçi silinərkən xəta baş verdi');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          position: userData.position,
          status: userData.status,
          language: userData.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      if (userData.role !== selectedUser.role ||
          userData.region_id !== selectedUser.region_id ||
          userData.sector_id !== selectedUser.sector_id ||
          userData.school_id !== selectedUser.school_id) {
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({
            role: userData.role,
            region_id: userData.region_id || null,
            sector_id: userData.sector_id || null,
            school_id: userData.school_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', selectedUser.id);

        if (roleError) throw roleError;
      }

      toast.success(t('userUpdatedSuccessfully') || 'İstifadəçi uğurla yeniləndi');
      fetchUsers();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t('errorUpdatingUser') || 'İstifadəçi yenilənərkən xəta baş verdi');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'regionadmin': return 'default';
      case 'sectoradmin': return 'secondary';
      case 'schooladmin': return 'outline';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const getRoleTranslation = (role: string) => {
    const roleMap: Record<string, string> = {
      'superadmin': t('superadmin') || 'Super Admin',
      'regionadmin': t('regionadmin') || 'Region Admin',
      'sectoradmin': t('sectoradmin') || 'Sektor Admin',
      'schooladmin': t('schooladmin') || 'Məktəb Admin',
      'user': t('user') || 'İstifadəçi'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">{t('users') || 'İstifadəçilər'}</h3>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">{t('users') || 'İstifadəçilər'}</h3>
        
        {users.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            {t('noUsersFound') || 'İstifadəçi tapılmadı'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name') || 'Ad'}</TableHead>
                  <TableHead>{t('email') || 'Email'}</TableHead>
                  <TableHead>{t('role') || 'Rol'}</TableHead>
                  <TableHead>{t('entity') || 'Təşkilat'}</TableHead>
                  <TableHead>{t('status') || 'Status'}</TableHead>
                  <TableHead>{t('lastLogin') || 'Son giriş'}</TableHead>
                  <TableHead className="text-right">{t('actions') || 'Əməliyyatlar'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleTranslation(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === 'regionadmin' && user.region ? user.region : 
                       user.role === 'sectoradmin' && user.sector ? user.sector :
                       user.role === 'schooladmin' && user.school ? user.school : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status === 'active' ? (t('active') || 'Aktiv') : (t('inactive') || 'Deaktiv')}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.last_login ? formatDate(user.last_login) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{t('openMenu') || 'Menyu aç'}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('edit') || 'Redaktə et'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteUser(user)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('delete') || 'Sil'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {selectedUser && (
        <>
          <EditUserDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleUpdateUser}
            user={selectedUser}
          />

          <DeleteConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={confirmDeleteUser}
            title={t('deleteUser') || 'İstifadəçini sil'}
            description={t('deleteUserConfirmation') || 'Bu istifadəçini silmək istədiyinizə əminsiniz?'}
            isDeleting={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default UserListTable;
