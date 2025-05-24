
import React, { useState, useEffect, useCallback, useRef } from 'react';
// Düzgün import yolları
import { useUserList, UserFilter } from '@/hooks/user/useUserList';
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
// Bu hook-u bəlkə ayrıca yaratmalı olacaq, hələlik sadə debounce istifadə edək
const useDebounceCallback = (callback: any, delay: number) => {
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

interface UserListProps {
  refreshTrigger?: number;
  filterParams?: UserFilter;
}

const UserList: React.FC<UserListProps> = ({ refreshTrigger = 0, filterParams = {} }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  
  // İstifadəçi sorğularının təkrarlanmasının qarşısını almaq üçün bir bayraq dəyişəni
  const initialFetchDone = useRef(false);
  
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
  
  // Helper function to get user display name
  const getUserDisplayName = (user: any) => {
    return user.full_name || user.name || 'N/A';
  };

  // Helper function to get entity name (safely)
  const getEntityName = (user: any) => {
    if (!user) return 'N/A';
    
    if (typeof user.entityName === 'string') {
      return user.entityName;
    } else if (user.entityName && typeof user.entityName === 'object') {
      return user.entityName.region || user.entityName.sector || user.entityName.school || 'N/A';
    } else {
      return 'N/A';
    }
  };

  // Debounce search to prevent too many requests (300ms delay)
  const debouncedUpdateFilter = useDebounceCallback((newFilter: UserFilter) => {
    updateFilter(newFilter);
  }, 300);
  
  // Effect for search term updates
  useEffect(() => {
    debouncedUpdateFilter({ ...filter, search: searchTerm });
  }, [searchTerm, debouncedUpdateFilter, filter]);

  // Handle refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch(true); // Force refresh
    }
  }, [refreshTrigger, refetch]);
  
  // İlk yüklənmə zamanı istifadəçiləri avtomatik çək - yalnız bir dəfə icra olunur
  const mountedRef = useRef(false);
  
  useEffect(() => {
    // Yalnız bir dəfə icra et - ilk render
    if (mountedRef.current) {
      return;
    }
    
    console.log('UserList mounted for the first time');
    mountedRef.current = true;
    initialFetchDone.current = true;
    
    // Component ilk dəfə yüklənəndə istifadəçiləri çək
    // Qeyd: boş asılılıq massivi - yalnız bir dəfə çağırılır
    refetch(true);
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter({ ...filter, search: searchTerm });
  };
  
  // Səhifələmə və render kontrolu üçün bayraqlar
  const lastPageRef = useRef<number>(1); // Son səhifəni yadda saxlamaq üçün
  const pageChangeInProgressRef = useRef<boolean>(false); // Səhifə dəyişikliyi prosesini izləmək üçün
  
  // Səhifə dəyişikliyi zamanı təkrar soruların qarşısını alırıq
  const handlePageChange = useCallback((page: number) => {
    // Səhifə dəyişikliyi davam edirsə və ya eyni səhifədirsə, geri qayıt
    if (pageChangeInProgressRef.current || page === lastPageRef.current) {
      console.log('Page change in progress or already on page:', page, '- skipping');
      return;
    }
    
    // Səhifə dəyişikliyi başladı
    pageChangeInProgressRef.current = true;
    
    console.log('Changing to page:', page, 'from', lastPageRef.current);
    lastPageRef.current = page;
    
    // Səhifəni dəyişdikdən sonra, bayraqı sıfırla
    setTimeout(() => {
      setCurrentPage(page);
      pageChangeInProgressRef.current = false;
    }, 50);
  }, [setCurrentPage]);
  
  const handleReset = useCallback(() => {
    setSearchTerm('');
    resetFilter();
  }, [resetFilter]);
  
  if (error) {
    console.error("Error loading users:", error);
    toast.error(t('errorLoadingUsers'), {
      description: typeof error === 'string' ? error : (error as any)?.message || t('tryAgainLater')
    });
  }
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
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
        <Button type="submit">{t('search')}</Button>
        {(searchTerm || Object.values(filter).some(Boolean)) && (
          <Button variant="outline" onClick={handleReset}>{t('reset')}</Button>
        )}
      </form>
      
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
                      <TableCell className="font-medium">{getUserDisplayName(user)}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {t(user.role) || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{getEntityName(user)}</TableCell>
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
            <div className="flex items-center justify-between px-4 py-2 border-t">
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
