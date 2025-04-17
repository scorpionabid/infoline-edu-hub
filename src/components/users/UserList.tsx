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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { MoreHorizontal, Search, Filter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { UserRole } from '@/types/supabase';
import { User, FullUserData } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { useUserList } from '@/hooks/useUserList';
import { Pagination } from '@/components/ui/pagination';
import UserFilters from './UserFilters';
import DeleteUserDialog from './DeleteUserDialog';
import EditUserDialog from './EditUserDialog';

interface UserListProps {
  currentUserRole?: string;
  currentUserRegionId?: string;
  onUserAddedOrEdited: () => void;
}

const UserList: React.FC<UserListProps> = ({
  currentUserRole,
  currentUserRegionId,
  onUserAddedOrEdited
}) => {
  const { t } = useLanguage();
  const {
    users,
    loading,
    error,
    filter,
    updateFilter,
    resetFilter,
    currentPage,
    pageSize,
    totalPages,
    handlePageChange,
    selectedUser,
    isEditDialogOpen,
    isDeleteDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    handleEditUser,
    handleDeleteUser,
    handleUpdateUserConfirm,
    handleDeleteUserConfirm,
  } = useUserList();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (searchQuery) {
      updateFilter({ search: searchQuery });
    } else {
      updateFilter({ search: undefined });
    }
  }, [searchQuery, updateFilter]);

  // Timeout üçün useEffect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        updateFilter({ search: searchQuery });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, updateFilter]);

  const handleFilterChange = (newFilters: any) => {
    updateFilter(newFilters);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const isUserSelected = (userId: string) => selectedUsers.includes(userId);

  // XƏTALİ HİSSƏ: Massiv undefined olduğunda slice xətası
  // Bu hissədə dəyişiklik edirik - əvvəlcə users massivinin varlığını yoxlayırıq
  const paginatedUsers = users ? users.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  ) : [];

  // Əgər yükləmə vəziyyətindədirsə yükləmə indikatoru göstər
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Xəta varsa göstər
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>{t('errorLoadingUsers')}: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('users')}</CardTitle>
          </div>
          <CardDescription>
            {t('manageUsers')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchUsers')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {t('filters')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <Card>
                  <CardContent>
                    <UserFilters
                      onFilterChange={handleFilterChange}
                      availableRoles={['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin']}
                    />
                  </CardContent>
                </Card>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox />
                  </TableHead>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers && paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <Checkbox
                          checked={isUserSelected(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{user.role}</Badge>
                      </TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              {t('editUser')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)}>
                              {t('deleteUser')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      {t('noUsersFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {t('showing')} {paginatedUsers?.length || 0} {t('of')} {users?.length || 0} {t('users')}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardFooter>
      </Card>

      {/* Edit Dialog - selectedUser undefined olduğu halda xətanın qarşısını alırıq */}
      {selectedUser && (
        <EditUserDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          user={selectedUser}
          onSave={handleUpdateUserConfirm}
        />
      )}

      {/* Delete Dialog - selectedUser undefined olduğu halda xətanın qarşısını alırıq */}
      {selectedUser && (
        <DeleteUserDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          user={selectedUser}
          onDelete={handleDeleteUserConfirm}
        />
      )}
    </div>
  );
};

export default UserList;
