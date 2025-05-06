
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { User } from '@/types/supabase';
import { FullUserData } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { useUserList } from '@/hooks/useUserList';
import { Pagination } from '@/components/ui/pagination';
import DeleteUserDialog from './DeleteUserDialog';
import EditUserDialog from './EditUserDialog';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface UserListProps {
  refreshTrigger?: number;
  filterParams?: {
    sectorId?: string;
    regionId?: string;
    role?: string;
  };
}

const UserList: React.FC<UserListProps> = ({
  refreshTrigger = 0,
  filterParams
}) => {
  const { t } = useLanguage();
  const {
    users,
    loading,
    error,
    filter,
    updateFilter,
    resetFilter,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    refetch
  } = useUserList();

  const { isSectorAdmin, sectorId, isRegionAdmin, regionId } = usePermissions();

  const [selectedUser, setSelectedUser] = useState<FullUserData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // FilterParams ilə filtri yeniləmək
  useEffect(() => {
    if (filterParams) {
      const newFilter = { ...filter };
      
      if (filterParams.sectorId) {
        newFilter.sectorId = filterParams.sectorId;
      }
      
      if (filterParams.regionId) {
        newFilter.regionId = filterParams.regionId;
      }
      
      if (filterParams.role) {
        newFilter.role = filterParams.role;
      }
      
      updateFilter(newFilter);
    }
  }, [filterParams, updateFilter]);

  // İstifadəçi roluna əsasən default filtir
  useEffect(() => {
    if (isSectorAdmin && sectorId) {
      updateFilter({
        ...filter,
        sectorId: sectorId,
        role: 'schooladmin'
      });
    } else if (isRegionAdmin && regionId) {
      updateFilter({
        ...filter,
        regionId: regionId
      });
    }
  }, [isSectorAdmin, sectorId, isRegionAdmin, regionId, updateFilter]);

  // refreshTrigger hər dəyişdikdə sorğunu yenilə
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleDeleteUser = async (userId: string) => {
    if (!userId) return;
    
    try {
      console.log('Deleting user with ID:', userId);
      let isPartiallyDeleted = false;
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      if (roleError) {
        console.error('Error deleting from user_roles:', roleError);
      } else {
        console.log('Successfully deleted from user_roles');
        isPartiallyDeleted = true;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error deleting from profiles:', profileError);
      } else {
        console.log('Successfully deleted from profiles');
        isPartiallyDeleted = true;
      }
      
      try {
        console.log('Attempting to delete user from auth via Edge Function...');
        const { data, error: authError } = await supabase.functions.invoke('delete-user', {
          body: { user_id: userId }
        });
        
        if (authError) {
          console.error('Error deleting from auth via Edge Function:', authError);
        } else {
          console.log('Successfully deleted from auth via Edge Function');
        }
      } catch (authErr) {
        console.error('Exception during auth deletion via Edge Function:', authErr);
      }
      
      refetch();
      
      if (isPartiallyDeleted) {
        toast.success(t('userDeletedSuccessfully'));
      } else {
        toast.error(t('errorDeletingUser'));
      }
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('errorDeletingUser'));
    }
  };

  const handleEditComplete = () => {
    setIsEditDialogOpen(false);
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'superadmin':
        return t('superadmin');
      case 'regionadmin':
        return t('regionadmin');
      case 'sectoradmin':
        return t('sectoradmin');
      case 'schooladmin':
        return t('schooladmin');
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'regionadmin':
        return 'bg-blue-100 text-blue-800';
      case 'sectoradmin':
        return 'bg-green-100 text-green-800';
      case 'schooladmin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-none border-0">
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-5">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-red-500">
            {error.message || "Xəta baş verdi"}
          </div>
        ) : users && users.length === 0 ? (
          <div className="text-center py-5 text-muted-foreground">
            {t('noUsersFound')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('entity')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || user.name || user.email?.split('@')[0]}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(String(user.role))}>
                        {formatRole(String(user.role))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.entityName || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? t('active') : t('inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setIsEditDialogOpen(true);
                          }}>
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}>
                            {t('delete')}
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
      
      {!loading && users && users.length > 0 && (
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {t('showingResults', { 
              from: (currentPage - 1) * 10 + 1, 
              to: Math.min(currentPage * 10, totalCount), 
              total: totalCount 
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        user={selectedUser || { id: '', email: '', name: '' }}
        onDelete={() => selectedUser?.id && handleDeleteUser(selectedUser.id)}
      />

      {selectedUser && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onComplete={handleEditComplete}
          user={selectedUser}
        />
      )}
    </Card>
  );
};

export default UserList;
