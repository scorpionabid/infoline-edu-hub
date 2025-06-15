
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { UserFilter, UserRole } from '@/types/user';
import { useLanguage } from '@/context/LanguageContext';

interface UserHeaderProps {
  onAddUser: () => void;
  onFilterChange: (filter: UserFilter) => void;
  currentFilter: UserFilter;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  onAddUser,
  onFilterChange,
  currentFilter
}) => {
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof UserFilter, value: any) => {
    onFilterChange({
      ...currentFilter,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const userRoles: UserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
  const userStatuses = ['active', 'inactive'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('users') || 'İstifadəçilər'}</h1>
          <p className="text-muted-foreground">
            {t('usersDescription') || 'Sistem istifadəçilərini idarə edin'}
          </p>
        </div>
        <Button onClick={onAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addUser') || 'İstifadəçi əlavə et'}
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('searchUsers') || 'İstifadəçi axtarın...'}
            value={currentFilter.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {t('filters') || 'Filterlər'}
        </Button>
        {(currentFilter.role?.length || currentFilter.status?.length || currentFilter.schoolId) && (
          <Button variant="ghost" onClick={clearFilters}>
            {t('clearFilters') || 'Filteri sil'}
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('role') || 'Rol'}
            </label>
            <Select
              value={currentFilter.role?.join(',') || ''}
              onValueChange={(value) => {
                if (value) {
                  handleFilterChange('role', [value as UserRole]);
                } else {
                  handleFilterChange('role', undefined);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectRole') || 'Rol seçin'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allRoles') || 'Bütün rollar'}</SelectItem>
                {userRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {t(role) || role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('status') || 'Status'}
            </label>
            <Select
              value={currentFilter.status?.join(',') || ''}
              onValueChange={(value) => {
                if (value) {
                  handleFilterChange('status', [value as 'active' | 'inactive']);
                } else {
                  handleFilterChange('status', undefined);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectStatus') || 'Status seçin'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allStatuses') || 'Bütün statuslar'}</SelectItem>
                {userStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(status) || status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('school') || 'Məktəb'}
            </label>
            <Input
              placeholder={t('schoolId') || 'Məktəb ID-si'}
              value={currentFilter.schoolId || ''}
              onChange={(e) => handleFilterChange('schoolId', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {currentFilter.role?.map((role) => (
          <div key={role} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center">
            {t('role')}: {t(role) || role}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => {
                const newRoles = currentFilter.role?.filter(r => r !== role);
                handleFilterChange('role', newRoles?.length ? newRoles : undefined);
              }}
            >
              ×
            </Button>
          </div>
        ))}
        
        {currentFilter.status?.map((status) => (
          <div key={status} className="bg-secondary/10 text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center">
            {t('status')}: {t(status) || status}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => {
                const newStatuses = currentFilter.status?.filter(s => s !== status);
                handleFilterChange('status', newStatuses?.length ? newStatuses : undefined);
              }}
            >
              ×
            </Button>
          </div>
        ))}
        
        {currentFilter.schoolId && (
          <div className="bg-accent/10 text-accent-foreground px-3 py-1 rounded-full text-sm flex items-center">
            {t('school')}: {currentFilter.schoolId}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-4 w-4 p-0"
              onClick={() => handleFilterChange('schoolId', undefined)}
            >
              ×
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHeader;
