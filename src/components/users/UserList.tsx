import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, UserPlus, Filter, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { User } from '@/types/user';
import { Pagination } from '@/components/ui/pagination';

interface UserListProps {
  users?: User[];
  isLoading?: boolean;
  onAddUser?: () => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, unknown>) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  refreshTrigger?: number;
  filterParams?: Record<string, unknown>;
}

const UserList: React.FC<UserListProps> = ({
  users = [],
  isLoading = false,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onSearch,
  onFilter,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  refreshTrigger,
  filterParams = {}
}) => {
  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'destructive';
      case 'regionadmin':
        return 'default';
      case 'sectoradmin':
        return 'secondary';
      case 'schooladmin':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Calculate if we should show pagination
  const showPagination = typeof currentPage === 'number' && 
    typeof totalPages === 'number' && 
    totalPages > 1 && 
    typeof onPageChange === 'function';

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('users')}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            {t('filter')}
          </Button>
          {onAddUser && (
            <Button size="sm" onClick={onAddUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('addUser')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchUsers')}
              className="pl-8"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-muted/50 p-3 rounded-md">
              <h4 className="text-sm font-medium mb-2">{t('filters')}</h4>
              {/* Filter controls would go here */}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : safeUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (t('noUsersFound') || 'No users found') : (t('noUsers') || 'No users available')}
            </div>
          ) : (
            <div className="space-y-2">
              {safeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{user.full_name || user.email}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    {onEditUser && (
                      <Button variant="ghost" size="sm" onClick={() => onEditUser(user)}>
                        {t('edit')}
                      </Button>
                    )}
                    {onDeleteUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDeleteUser(user)}
                      >
                        {t('delete')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {showPagination && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserList;
