
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData, UserRole, UserStatus } from '@/types/user';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, UserCog, PlusCircle, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserFilter } from '@/types/user';
import EditUserDialog from './EditUserDialog';
import AddUserDialog from './AddUserDialog';
import { supabase } from '@/integrations/supabase/client';
import { ensureFilterDefaults } from '@/utils/filterHelpers';

interface UserListProps {
  users: FullUserData[];
  filter: UserFilter;
  onFilterChange: (filter: UserFilter) => void;
  loading: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  refetch: () => void;
}

const UserList: React.FC<UserListProps> = ({
  users = [],
  filter,
  onFilterChange,
  loading = false,
  totalPages = 1,
  currentPage = 1,
  onPageChange = () => {},
  refetch = () => {}
}) => {
  const { t } = useLanguage();
  
  // Ensure filter has default values
  const safeFilter = ensureFilterDefaults(filter);
  
  // Initialize searchQuery with the filter.search value or empty string if undefined
  const [searchQuery, setSearchQuery] = useState(safeFilter.search || '');
  const [selectedUser, setSelectedUser] = useState<FullUserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [processedUsers, setProcessedUsers] = useState<FullUserData[]>(users);

  // Process user data when it changes
  useEffect(() => {
    if (users && users.length > 0) {
      // Process users to normalize property names
      const processed = users.map(user => {
        // Make sure the processed user objects have the correct type
        const processedUser: FullUserData = {
          id: user.id,
          email: user.email,
          full_name: user.full_name || user.fullName || user.name || '',
          name: user.full_name || user.fullName || user.name || '',
          role: (user.role as UserRole) || 'user',
          status: (user.status as UserStatus) || 'active',
          region_id: user.region_id || user.regionId || '',
          regionId: user.region_id || user.regionId || '',
          sector_id: user.sector_id || user.sectorId || '',
          sectorId: user.sector_id || user.sectorId || '',
          school_id: user.school_id || user.schoolId || '',
          schoolId: user.school_id || user.schoolId || '',
          phone: user.phone || '',
          position: user.position || '',
          language: user.language || '',
          created_at: user.created_at || user.createdAt || '',
          updated_at: user.updated_at || user.updatedAt || '',
          last_login: user.last_login || user.lastLogin || '',
          avatar: user.avatar || '',
          notificationSettings: user.notificationSettings || {
            email: true,
            inApp: true,
            push: true,
            system: true,
            deadline: true
          }
        };
        return processedUser;
      });
      
      setProcessedUsers(processed);
    } else {
      setProcessedUsers([]);
    }
  }, [users]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timer = setTimeout(() => {
      onFilterChange({
        ...(safeFilter),
        search: value,
        page: 1 // Reset to first page on search
      });
    }, 300);
    
    return () => clearTimeout(timer);
  };

  // Show edit user dialog
  const handleEditUser = (user: FullUserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
    setSelectedUser(null);
  };

  // Handle dialog complete
  const handleDialogComplete = () => {
    handleDialogClose();
    refetch();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>{t('users')}</CardTitle>
            <CardDescription>
              {loading 
                ? t('loadingUsers') 
                : t('totalUsersCount', { count: processedUsers.length })}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('searchUsers')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full md:w-[200px] pl-8"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    onFilterChange({
                      ...safeFilter,
                      search: '',
                      page: 1
                    });
                  }}
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('addUser')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">{t('name')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('email')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('role')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('entity')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('status')}</th>
                  <th className="py-3 px-4 text-left font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : processedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-muted-foreground">
                      {searchQuery ? t('noUsersFound') : t('noUsers')}
                    </td>
                  </tr>
                ) : (
                  processedUsers.map(user => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{user.full_name}</div>
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {user.role?.replace('admin', ' Admin')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.school_name || user.sector_name || user.region_name || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {user.status || 'unknown'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            {t('edit')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && onPageChange && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                {t('pageOf', { current: currentPage, total: totalPages })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit User Dialog */}
      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={handleDialogClose}
        onComplete={handleDialogComplete}
        user={selectedUser}
      />
      
      {/* Add User Dialog */}
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={handleDialogClose}
        onComplete={handleDialogComplete}
        entityTypes={['school', 'sector', 'region']}
      />
    </>
  );
};

export default UserList;
