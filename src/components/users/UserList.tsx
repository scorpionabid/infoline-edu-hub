
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useUserList } from '@/hooks/user/useUserList';
import { UserFilter } from '@/types/user';
import SchoolPagination from '@/components/schools/SchoolPagination';

const UserList: React.FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<UserFilter>({});
  const [searchTerm, setSearchTerm] = useState('');

  const {
    users,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    onPageChange,
    refreshUsers,
    applyFilters
  } = useUserList(filters, { pageSize: 10 });

  // Apply search filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters({ ...filters, search: searchTerm });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filters, applyFilters]);

  const handleFilterChange = (key: keyof UserFilter, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
    applyFilters({});
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin': return t('user.superadmin');
      case 'regionadmin': return t('user.regionAdmin');
      case 'sectoradmin': return t('user.sectorAdmin');
      case 'schooladmin': return t('user.schoolAdmin');
      case 'teacher': return t('user.teacher');
      default: return role;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('user.active');
      case 'inactive': return t('user.inactive');
      case 'suspended': return t('user.suspended');
      default: return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('user.users')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('user.usersDescription')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('ui.refresh')}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('ui.export')}
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {t('ui.import')}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('user.create_user')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('user.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('user.searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select
              value={filters.role as string || 'all'}
              onValueChange={(value) => handleFilterChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('user.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('user.allRoles')}</SelectItem>
                <SelectItem value="superadmin">{t('user.superadmin')}</SelectItem>
                <SelectItem value="regionadmin">{t('user.regionAdmin')}</SelectItem>
                <SelectItem value="sectoradmin">{t('user.sectorAdmin')}</SelectItem>
                <SelectItem value="schooladmin">{t('user.schoolAdmin')}</SelectItem>
                <SelectItem value="teacher">{t('user.teacher')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status as string || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('user.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('user.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('user.active')}</SelectItem>
                <SelectItem value="inactive">{t('user.inactive')}</SelectItem>
                <SelectItem value="suspended">{t('user.suspended')}</SelectItem>
                <SelectItem value="deleted">{t('user.deletedUsers')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={handleClearFilters}>
              {t('user.clearFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              {t('dashboard.loading')}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-600">
              {t('dashboard.errorOccurred')}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('user.noUsers')}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('user.name')}</TableHead>
                    <TableHead>{t('user.email')}</TableHead>
                    <TableHead>{t('user.role')}</TableHead>
                    <TableHead>{t('user.status')}</TableHead>
                    <TableHead>{t('user.lastLogin')}</TableHead>
                    <TableHead className="text-right">{t('user.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || user.name || '-'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRoleLabel(user.role || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(user.status || 'inactive')}>
                          {getStatusLabel(user.status || 'inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString()
                          : t('user.never')
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="border-t">
                <SchoolPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  onPageSizeChange={() => {}} // TODO: implement page size change
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserList;
