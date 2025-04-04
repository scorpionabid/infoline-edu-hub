
import React, { useState, useEffect } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckCircle, 
  DotsHorizontal, 
  Edit, 
  Eye, 
  Lock, 
  MoreHorizontal, 
  Pencil, 
  Plus, 
  RefreshCw, 
  Trash, 
  UserCog, 
  Users, 
  XCircle 
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserStatus } from '@/types/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: UserStatus;
  avatar?: string;
  regionName?: string;
  sectorName?: string;
  schoolName?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onDelete: (userId: string) => void;
  onEdit: (user: User) => void;
  onView: (userId: string) => void;
  onAdd: () => void;
  onStatusChange: (userId: string, status: UserStatus) => void;
  onResetPassword: (email: string) => void;
}

export function UserList({
  users,
  isLoading,
  onDelete,
  onEdit,
  onView,
  onAdd,
  onStatusChange,
  onResetPassword
}: UserListProps) {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | ''>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Update filtered users when users prop changes or filters change
  useEffect(() => {
    let filtered = [...users];

    // Apply role filter
    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(lowerQuery) || 
        user.email.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredUsers(filtered);
  }, [users, selectedRole, selectedStatus, searchQuery]);

  // Extract unique roles from users
  const roles = [...new Set(users.map(user => user.role))];

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedRole('');
    setSelectedStatus('');
  };

  // Handle delete confirmation
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedUser) {
      onDelete(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success(t('userDeleted'));
    }
  };

  // Handle reset password
  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  // Confirm reset password
  const confirmResetPassword = () => {
    if (selectedUser && selectedUser.email) {
      onResetPassword(selectedUser.email);
      setResetPasswordDialogOpen(false);
      setSelectedUser(null);
      toast.success(t('resetPasswordEmailSent'), {
        description: t('resetPasswordEmailDescription')
      });
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">{t('active')}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{t('inactive')}</Badge>;
      case 'blocked':
        return <Badge variant="destructive">{t('blocked')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and search controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <input
            type="text"
            placeholder={t('searchUsers')}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">{t('allRoles')}</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {t(role)}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as UserStatus)}
          >
            <option value="">{t('allStatuses')}</option>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
            <option value="blocked">{t('blocked')}</option>
          </select>

          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('reset')}
          </Button>
        </div>
      </div>

      {/* Add User Button */}
      <div className="flex justify-end">
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" /> {t('addUser')}
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="h-10 px-4 text-left font-medium">{t('user')}</th>
                <th className="h-10 px-4 text-left font-medium">{t('email')}</th>
                <th className="h-10 px-4 text-left font-medium">{t('role')}</th>
                <th className="h-10 px-4 text-left font-medium">{t('region')}</th>
                <th className="h-10 px-4 text-left font-medium">{t('sector')}</th>
                <th className="h-10 px-4 text-left font-medium">{t('school')}</th>
                <th className="h-10 px-4 text-left font-medium">{t('status')}</th>
                <th className="h-10 px-4 text-right font-medium">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">{t('loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">{t('noUsers')}</p>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="mt-4"
                        onClick={onAdd}
                      >
                        <Plus className="h-4 w-4 mr-2" /> {t('addUser')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{t(user.role)}</Badge>
                    </td>
                    <td className="p-4">{user.regionName || '-'}</td>
                    <td className="p-4">{user.sectorName || '-'}</td>
                    <td className="p-4">{user.schoolName || '-'}</td>
                    <td className="p-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <DotsHorizontal className="h-4 w-4" />
                            <span className="sr-only">{t('openMenu')}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(user.id)}>
                            <Eye className="h-4 w-4 mr-2" /> {t('view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit className="h-4 w-4 mr-2" /> {t('edit')}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                            <Lock className="h-4 w-4 mr-2" /> {t('resetPassword')}
                          </DropdownMenuItem>
                          
                          {user.id !== currentUser?.id && (
                            <>
                              {user.status === 'active' && (
                                <DropdownMenuItem onClick={() => onStatusChange(user.id, 'inactive')}>
                                  <XCircle className="h-4 w-4 mr-2" /> {t('deactivate')}
                                </DropdownMenuItem>
                              )}
                              {user.status === 'inactive' && (
                                <DropdownMenuItem onClick={() => onStatusChange(user.id, 'active')}>
                                  <CheckCircle className="h-4 w-4 mr-2" /> {t('activate')}
                                </DropdownMenuItem>
                              )}
                              {user.status !== 'blocked' && (
                                <DropdownMenuItem onClick={() => onStatusChange(user.id, 'blocked')}>
                                  <Lock className="h-4 w-4 mr-2" /> {t('block')}
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash className="h-4 w-4 mr-2" /> {t('delete')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteUserConfirmation', {
                name: selectedUser?.name || '',
                email: selectedUser?.email || ''
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700" 
              onClick={confirmDelete}
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmResetPassword')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('resetPasswordConfirmation', {
                email: selectedUser?.email || ''
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetPassword}>
              {t('sendResetLink')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
