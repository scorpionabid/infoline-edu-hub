
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { FilterOption, UserFilter } from './UserSelectParts/types';

interface UserFiltersProps {
  filter: UserFilter;
  setFilter: React.Dispatch<React.SetStateAction<UserFilter>>;
  roleOptions: FilterOption[];
  statusOptions: FilterOption[];
  onSearch: () => void;
  regions?: FilterOption[];
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filter = {}, // Provide default empty object
  setFilter,
  roleOptions = [], // Default to empty arrays if undefined
  statusOptions = [],
  onSearch,
  regions = []
}) => {
  const { t } = useLanguage();
  
  // Ensure filter is not undefined before accessing properties
  const safeFilter: UserFilter = filter || {};

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...safeFilter, search: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFilter({ ...safeFilter, role: value || '' });
  };

  const handleStatusChange = (value: string) => {
    setFilter({ ...safeFilter, status: value || '' });
  };

  const handleRegionChange = (value: string) => {
    setFilter({ ...safeFilter, region_id: value || '' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  // Safely access filter properties with fallbacks
  const currentRole = typeof safeFilter.role === 'string' ? safeFilter.role : '';
  const currentStatus = typeof safeFilter.status === 'string' ? safeFilter.status : '';
  const currentRegionId = safeFilter.region_id || '';

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <Input
        placeholder={t('searchByNameOrEmail')}
        value={safeFilter.search || ''}
        onChange={handleSearchTermChange}
        onKeyDown={handleKeyDown}
        className="flex-grow md:w-auto"
      />
      
      <Select
        value={currentRole}
        onValueChange={handleRoleChange}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder={t('role')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t('allRoles')}</SelectItem>
          {roleOptions.map(role => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder={t('status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t('allStatuses')}</SelectItem>
          {statusOptions.map(status => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {regions && regions.length > 0 && (
        <Select
          value={currentRegionId}
          onValueChange={handleRegionChange}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('region')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allRegions')}</SelectItem>
            {regions.map(region => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      <Button onClick={onSearch}>
        {t('search')}
      </Button>
    </div>
  );
};

export default UserFilters;
