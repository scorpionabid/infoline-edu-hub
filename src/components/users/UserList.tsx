
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData, UserFormData } from '@/types/user';
import { mockUsers, User } from '@/data/mockUsers';
import DeleteUserDialog from './DeleteUserDialog';
import UserFormDialog from './UserFormDialog';
import UserDetailsDialog from './UserDetailsDialog';
import UserListTable from './UserListTable';
import { AlertTriangle, Search, Plus, Trash2, Filter, Download } from 'lucide-react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Badge } from '../ui/badge';
import { useLocationParams } from '@/hooks/useLocationParams';
import { TooltipProvider } from '@/components/ui/tooltip';

// Geçici olarak mockUsers'ı FullUserData tipine çeviriyoruz - sonra gerçek API entegrasyonu ile değişecek
const adaptUserToFullUserData = (user: User): FullUserData => {
  return {
    ...user,
    full_name: user.full_name || `${user.first_name} ${user.last_name}`,
    status: user.status || 'active',
    role: user.role || 'user',
    position: user.position || '',
  };
};

const UserList: React.FC = () => {
  const { t } = useLanguage();
  const { userRole } = usePermissions();
  const { getParam, setParam, clearAllParams } = useLocationParams();
  
  // State
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FullUserData | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    role: 'user',
    status: 'active',
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(getParam('search') || '');
  const [roleFilter, setRoleFilter] = useState(getParam('role') || '');
  const [statusFilter, setStatusFilter] = useState(getParam('status') || '');
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Load mock data - will be replaced with real API calls
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      const adaptedUsers = mockUsers.map(adaptUserToFullUserData);
      setUsers(adaptedUsers);
      setIsDataLoading(false);
    }, 500);
  }, []);
  
  // Apply filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handlers  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setParam('search', e.target.value);
  };
  
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setParam('role', value);
  };
  
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setParam('status', value);
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('');
    clearAllParams();
  };
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      full_name: '',
      role: 'user',
      status: 'active',
    });
    setIsFormDialogOpen(true);
  };
  
  const handleEditUser = (user: FullUserData) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      position: user.position || '',
      region_id: user.region_id,
      sector_id: user.sector_id,
      school_id: user.school_id,
    });
    setIsFormDialogOpen(true);
  };
  
  const handleViewUserDetails = (user: FullUserData) => {
    setSelectedUser(user);
    setIsDetailsDialogOpen(true);
  };
  
  const handleDeleteUser = (user: FullUserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleUserSubmit = (formData: UserFormData) => {
    if (selectedUser) {
      // Edit existing user
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id ? { ...user, ...formData } : user
      );
      setUsers(updatedUsers);
    } else {
      // Add new user
      const newUser: FullUserData = {
        id: `new-user-${Date.now()}`,
        ...formData,
        full_name: formData.full_name || '',
        status: formData.status || 'active',
        role: formData.role || 'user',
        email: formData.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
      };
      setUsers([...users, newUser]);
    }
    setIsFormDialogOpen(false);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedUser) {
      const updatedUsers = users.filter(user => user.id !== selectedUser.id);
      setUsers(updatedUsers);
      setIsDeleteDialogOpen(false);
    }
  };

  // Custom user rendering for the table
  const renderUserRow = (user: FullUserData) => {
    return (
      <tr key={user.id} className="hover:bg-muted/50">
        <td className="p-4 align-middle">{user.full_name}</td>
        <td className="p-4 align-middle">{user.email}</td>
        <td className="p-4 align-middle">
          <Badge variant="outline">{user.role}</Badge>
        </td>
        <td className="p-4 align-middle">
          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Heç vaxt'}
        </td>
        <td className="p-4 align-middle">
          <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
            {user.status === 'active' ? t('active') : t('inactive')}
          </Badge>
        </td>
        <td className="p-4 align-middle text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewUserDetails(user)}
            >
              {t('details')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditUser(user)}
            >
              {t('edit')}
            </Button>
            {userRole === 'superadmin' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => handleDeleteUser(user)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t('delete')}
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t('userManagement')}</h1>
          <div className="flex gap-2">
            {(userRole === 'superadmin' || userRole === 'regionadmin') && (
              <Button onClick={handleAddUser}>
                <Plus className="h-4 w-4 mr-2" />
                {t('addUser')}
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>{t('users')}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchUsers')}
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Download className="h-4 w-4 mr-1" />
                  {t('export')}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {}}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="rounded-lg border mb-6 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('filterByRole')}</label>
                <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('allRoles')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('allRoles')}</SelectItem>
                    <SelectItem value="superadmin">{t('superadmin')}</SelectItem>
                    <SelectItem value="regionadmin">{t('regionAdmin')}</SelectItem>
                    <SelectItem value="sectoradmin">{t('sectorAdmin')}</SelectItem>
                    <SelectItem value="schooladmin">{t('schoolAdmin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">{t('filterByStatus')}</label>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('allStatuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('allStatuses')}</SelectItem>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  {t('resetFilters')}
                </Button>
              </div>
            </div>
            
            {isDataLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                <h3 className="font-semibold text-lg">{t('noUsersFound')}</h3>
                <p className="text-muted-foreground mt-1">{t('tryChangingFilters')}</p>
              </div>
            ) : (
              <UserListTable
                users={filteredUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onViewDetails={handleViewUserDetails}
                currentUserRole={userRole as any}
                renderRow={undefined}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Dialogs */}
        <UserFormDialog 
          isOpen={isFormDialogOpen}
          onClose={() => setIsFormDialogOpen(false)}
          onSubmit={handleUserSubmit}
          formData={formData}
          setFormData={setFormData}
          isEditMode={!!selectedUser}
          currentUserRole={userRole}
        />
        
        <DeleteUserDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          userName={selectedUser?.full_name || ''}
        />
        
        <UserDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          user={selectedUser}
          onEdit={() => {
            setIsDetailsDialogOpen(false);
            if (selectedUser) {
              handleEditUser(selectedUser);
            }
          }}
        />
      </div>
    </TooltipProvider>
  );
};

export default UserList;
