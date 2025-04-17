import React, { useState, useEffect, useCallback } from 'react';
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
import { format } from 'date-fns';
import { Plus, MoreHorizontal, UserPlus, Search, Filter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { UserRole } from '@/types/supabase';
import { User, FullUserData } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { mockUsers } from '@/data/mockUsers';
import { useRole } from '@/context/auth/useRole';
import { Pagination } from '@/components/ui/pagination';
import UserFilters from './UserFilters';
import DeleteUserDialog from './DeleteUserDialog';
import EditUserDialog from './EditUserDialog';

interface UserListProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onFiltersChange: (filters: any) => void;
  availableRoles: UserRole[];
}

const UserList: React.FC<UserListProps> = ({
  users,
  loading,
  error,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onFiltersChange,
  availableRoles
}) => {
  const { t } = useLanguage();
  const isSuperAdmin = useRole('superadmin');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    role: [],
    status: [],
    region: [],
    sector: [],
    school: []
  });

  // Mock data istifadə edərək ümumi istifadəçi sayı
  const totalUsersCount = mockUsers.length;

  // Funksiya komponent yükləndikdə filtrləri tətbiq etmək üçün
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success(t('userDeleted'));
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleSaveUser = (updatedUser: User) => {
    onEditUser(updatedUser);
    setIsEditDialogOpen(false);
    setUserToEdit(null);
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

  const paginatedUsers = users.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('users')}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={onAddUser}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addUser')}
              </Button>
            </div>
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
                      availableRoles={availableRoles}
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
                {paginatedUsers.map((user) => (
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
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            {t('editUser')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(user.id)}>
                            {t('deleteUser')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Pagination
            page={page}
            onPageChange={setPage}
            totalCount={totalUsersCount}
            itemsPerPage={itemsPerPage}
            setItemPerPage={setItemsPerPage}
          />
          <div>
            {selectedUsers.length > 0 && (
              <Button variant="destructive" size="sm">
                {t('deleteSelected')} ({selectedUsers.length})
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <DeleteUserDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={userToEdit!}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserList;
