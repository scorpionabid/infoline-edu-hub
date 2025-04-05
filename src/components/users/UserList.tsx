
import React from 'react';
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
import { FullUserData, UserRole } from '@/types/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Card } from '@/components/ui/card';
import { useRole, Role } from '@/context/AuthContext';
import { FilterX, Search, MoreHorizontal, Edit, Trash2, UserCog, Building2, BookOpen, School } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditUserDialog from './EditUserDialog';
import DeleteUserDialog from './DeleteUserDialog';
import UserDetailsDialog from './UserDetailsDialog';
import { format } from 'date-fns';
import { useUserList } from '@/hooks/useUserList';

interface UserListProps {
  currentUserRole?: Role;
  currentUserRegionId?: string;
}

const UserList: React.FC<UserListProps> = ({ currentUserRole, currentUserRegionId }) => {
  const { t } = useLanguage();
  const isSuperAdmin = useRole('superadmin');
  
  const {
    users,
    loading,
    filter,
    currentPage,
    totalPages,
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
  } = useUserList();

  const getRoleBadgeStyle = (role: UserRole) => {
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

  // Determine if user is editable by current user
  const canEditUser = (user: FullUserData) => {
    if (isSuperAdmin) return true;
    if (currentUserRole === 'regionadmin' && currentUserRegionId === user.region_id) return true;
    return false;
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return t('never');
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return t('invalidDate');
    }
  };

  // Get admin entity display info
  const renderAdminEntityInfo = (user: FullUserData) => {
    if (!user.adminEntity) return null;
    
    const { type, name } = user.adminEntity;
    
    if (type === 'region') {
      return (
        <div className="flex items-center">
          <Building2 className="h-4 w-4 mr-1 text-blue-600" />
          <span>{name}</span>
        </div>
      );
    } else if (type === 'sector') {
      return (
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-1 text-green-600" />
          <span>{name}</span>
        </div>
      );
    } else if (type === 'school') {
      return (
        <div className="flex items-center">
          <School className="h-4 w-4 mr-1 text-orange-600" />
          <span>{name}</span>
        </div>
      );
    }
    
    return null;
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
              onChange={(e) => updateFilter({ search: e.target.value })}
              className="w-full pl-9"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select
            value={filter.role || "all"}
            onValueChange={(value) => updateFilter({ role: value !== "all" ? value as UserRole : undefined })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('selectRole')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allRoles')}</SelectItem>
              <SelectItem value="superadmin">{t('superadmin')}</SelectItem>
              <SelectItem value="regionadmin">{t('regionadmin')}</SelectItem>
              <SelectItem value="sectoradmin">{t('sectoradmin')}</SelectItem>
              <SelectItem value="schooladmin">{t('schooladmin')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filter.status || "all"}
            onValueChange={(value) => updateFilter({ status: value !== "all" ? value : undefined })}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="blocked">{t('blocked')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={resetFilter}
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
              <TableHead>{t('adminEntity')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('lastLogin')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    <span className="ml-2">{t('loading')}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  {t('noUsersFound')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.full_name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.full_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeStyle(user.role)}>
                      {t(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {renderAdminEntityInfo(user)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeStyle(user.status)}>
                      {t(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(user.last_login)}
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
                          onClick={() => handleViewDetails(user)}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          {t('viewDetails')}
                        </DropdownMenuItem>
                        
                        {canEditUser(user) && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {t('edit')}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('delete')}
                            </DropdownMenuItem>
                          </>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            {t('previous')}
          </Button>
          <div className="text-sm">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            {t('next')}
          </Button>
        </div>
      )}
      
      {/* Dialog Components */}
      {selectedUser && (
        <>
          <UserDetailsDialog
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            user={selectedUser}
          />
          
          <EditUserDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            user={selectedUser}
            onSave={handleUpdateUserConfirm}
          />
          
          <DeleteUserDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            user={selectedUser}
            onDelete={handleDeleteUserConfirm}
          />
        </>
      )}
    </Card>
  );
};

export default UserList;
