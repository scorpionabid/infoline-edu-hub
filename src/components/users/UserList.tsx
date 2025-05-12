
import React, { useState, useEffect, useCallback } from 'react';
import { useUserList, UserFilter } from '@/hooks/useUserList';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Edit, Trash2, ArrowUpDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import UserActions from './UserActions';
import { useLanguage } from '@/context/LanguageContext';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserListProps {
  refreshTrigger?: number;
  filterParams?: UserFilter;
}

const UserList: React.FC<UserListProps> = ({ refreshTrigger = 0, filterParams = {} }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize filter with provided params
  const defaultFilter = {
    ...filterParams,
    search: ''
  };
  
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
  } = useUserList(defaultFilter);
  
  // Debounce search to prevent too many requests
  const debouncedSearch = useCallback(
    (value: string) => {
      const handler = setTimeout(() => {
        updateFilter({ ...filter, search: value });
      }, 300);
      
      return () => clearTimeout(handler);
    },
    [filter, updateFilter]
  );
  
  // Handle search input change - prevent loop by using effect cleanup
  useEffect(() => {
    const cleanup = debouncedSearch(searchTerm);
    return cleanup;
  }, [searchTerm, debouncedSearch]);
  
  // Handle refresh trigger from parent without causing loops
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Refresh triggered:', refreshTrigger);
      refetch();
    }
  }, [refreshTrigger, refetch]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ ...filter, search: searchTerm });
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle role filter change
  const handleRoleFilter = (value: string) => {
    updateFilter({ ...filter, role: value });
  };

  // Handle status filter change 
  const handleStatusFilter = (value: string) => {
    updateFilter({ ...filter, status: value });
  };
  
  if (error) {
    console.error("Error loading users:", error);
    toast.error(t('errorLoadingUsers'), {
      description: error.message || t('tryAgainLater')
    });
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('searchUsers')}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" className="whitespace-nowrap">{t('search')}</Button>
        </form>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={filter.role || ''} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Bütün rollar</SelectItem>
              <SelectItem value="superadmin">Super Admin</SelectItem>
              <SelectItem value="regionadmin">Region Admin</SelectItem>
              <SelectItem value="sectoradmin">Sektor Admin</SelectItem>
              <SelectItem value="schooladmin">Məktəb Admin</SelectItem>
              <SelectItem value="user">İstifadəçi</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filter.status || ''} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Bütün statuslar</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Qeyri-aktiv</SelectItem>
              <SelectItem value="blocked">Bloklanan</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchTerm || Object.values(filter).some(Boolean)) && (
            <Button 
              variant="outline" 
              className="whitespace-nowrap"
              onClick={() => {
                setSearchTerm('');
                resetFilter();
              }}
            >
              {t('reset')}
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
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
                {loading ? (
                  // Loading skeletons
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || user.name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {t(user.role) || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.entityName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          user.status === 'active' ? 'bg-green-500' :
                          user.status === 'inactive' ? 'bg-yellow-500' :
                          'bg-red-500'
                        } text-white`}>
                          {t(user.status) || user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <UserActions user={user} onAction={refetch} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {t('noUsersFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-2 border-t">
              <div className="text-sm text-muted-foreground">
                {t('showingNofMResults', { n: users.length, m: totalCount })}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserList;
