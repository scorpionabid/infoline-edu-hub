import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
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
import { UserRole } from '@/types/supabase';
import { User, FullUserData } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { useUserList } from '@/hooks/useUserList';
import { Pagination } from '@/components/ui/pagination';
import DeleteUserDialog from './DeleteUserDialog';
import EditUserDialog from './EditUserDialog';

interface UserListProps {
  refreshTrigger?: number;
  filterParams?: {
    sectorId?: string;
    regionId?: string;
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
    deleteUser,
    fetchUsers
  } = useUserList();

  const [selectedUser, setSelectedUser] = useState<FullUserData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filteri yeniləyək
  useEffect(() => {
    if (filterParams) {
      updateFilter({
        ...filter,
        ...filterParams
      });
    }
  }, [filterParams]);

  // refreshTrigger dəyişdikdə istifadəçiləri yenidən yükləyək
  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  // İstifadəçi silmə əməliyyatı
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      toast.success(t('userDeletedSuccessfully'));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('errorDeletingUser'));
    }
  };

  // İstifadəçi redaktə əməliyyatı tamamlandıqda
  const handleEditComplete = () => {
    setIsEditDialogOpen(false);
    fetchUsers();
  };

  // Səhifələmə
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // İstifadəçi rolunu formatla
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

  // Rola görə badge rəngi
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
        ) : users.length === 0 ? (
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
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName || user.email.split('@')[0]}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                        {formatRole(user.role)}
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
      
      {!loading && users.length > 0 && (
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {t('showingResults', { from: (currentPage - 1) * 10 + 1, to: Math.min(currentPage * 10, totalCount), total: totalCount })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* İstifadəçi silmə dialoqu */}
      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        userName={selectedUser?.fullName || selectedUser?.email || ''}
      />

      {/* İstifadəçi redaktə dialoqu */}
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
