
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { User, UserFilter } from '@/types/user';
import { useTranslation } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { useRole, Role } from '@/context/AuthContext';
import { FilterX, Search, MoreHorizontal, Edit, Trash2, UserCog } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditUserDialog from './EditUserDialog';
import DeleteUserDialog from './DeleteUserDialog';
import UserDetailsDialog from './UserDetailsDialog';
import { format } from 'date-fns';

// Mock data
import { mockUsers } from '@/data/mockUsers';

interface UserListProps {
  currentUserRole?: Role;
  currentUserRegionId?: string;
}

const UserList: React.FC<UserListProps> = ({ currentUserRole, currentUserRegionId }) => {
  const { t } = useTranslation();
  const isSuperAdmin = useRole('superadmin');
  
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filter, setFilter] = useState<UserFilter>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filter users based on current filter
  const filteredUsers = React.useMemo(() => {
    let result = [...users];
    
    // Filter by role if specified
    if (filter.role) {
      result = result.filter(user => user.role === filter.role);
    }
    
    // Filter by status if specified
    if (filter.status) {
      result = result.filter(user => user.status === filter.status);
    }
    
    // Filter by regionId (for region admins)
    if (!isSuperAdmin && currentUserRegionId) {
      result = result.filter(user => user.regionId === currentUserRegionId);
    }
    
    // Filter by search term if specified
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    
    return result;
  }, [users, filter, isSuperAdmin, currentUserRegionId]);

  // Handle user update
  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    toast.success(t('userUpdated'), {
      description: t('userUpdatedDesc')
    });
  };

  // Handle user deletion
  const handleUserDelete = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast.success(t('userDeleted'), {
      description: t('userDeletedDesc')
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilter({});
  };

  // Determine if user is editable by current user
  const canEditUser = (user: User) => {
    if (isSuperAdmin) return true;
    if (currentUserRole === 'regionadmin' && currentUserRegionId === user.regionId) return true;
    return false;
  };

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'regionadmin':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'sectoradmin':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'schooladmin':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'blocked':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-1 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchUsers')}
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-9"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select
            value={filter.role || ''}
            onValueChange={(value) => setFilter({ ...filter, role: value ? value as Role : undefined })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('selectRole')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('allRoles')}</SelectItem>
              <SelectItem value="superadmin">{t('superadmin')}</SelectItem>
              <SelectItem value="regionadmin">{t('regionadmin')}</SelectItem>
              <SelectItem value="sectoradmin">{t('sectoradmin')}</SelectItem>
              <SelectItem value="schooladmin">{t('schooladmin')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filter.status || ''}
            onValueChange={(value) => setFilter({ ...filter, status: value ? value as 'active' | 'inactive' | 'blocked' : undefined })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="blocked">{t('blocked')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleResetFilters}
            disabled={!filter.role && !filter.status && !filter.search}
          >
            <FilterX className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('user')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('role')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('lastLogin')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  {t('noUsersFound')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeStyle(user.role)}>
                      {t(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeStyle(user.status)}>
                      {t(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm') : t('never')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <UserCog className="mr-2 h-4 w-4" />
                          {t('viewDetails')}
                        </DropdownMenuItem>
                        
                        {canEditUser(user) && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t('edit')}
                          </DropdownMenuItem>
                        )}
                        
                        {canEditUser(user) && user.id !== 'superadmin-1' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteDialog(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog components */}
      {selectedUser && (
        <>
          <EditUserDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            user={selectedUser}
            onSave={handleUserUpdate}
          />
          
          <DeleteUserDialog 
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            user={selectedUser}
            onDelete={handleUserDelete}
          />
          
          <UserDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            user={selectedUser}
          />
        </>
      )}
    </Card>
  );
};

export default UserList;
