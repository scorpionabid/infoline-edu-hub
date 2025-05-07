
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
  filter,
  setFilter,
  roleOptions,
  statusOptions,
  onSearch,
  regions = []
}) => {
  const { t } = useLanguage();

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ ...filter, search: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFilter({ ...filter, role: value ? [value] : [] });
  };

  const handleStatusChange = (value: string) => {
    setFilter({ ...filter, status: value ? [value] : [] });
  };

  const handleRegionChange = (value: string) => {
    setFilter({ ...filter, region_id: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <Input
        placeholder={t('searchByNameOrEmail')}
        value={filter.search || ''}
        onChange={handleSearchTermChange}
        onKeyDown={handleKeyDown}
        className="flex-grow md:w-auto"
      />
      
      <Select
        value={filter.role?.length ? filter.role[0] : ''}
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
        value={filter.status?.length ? filter.status[0] : ''}
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
      
      {regions.length > 0 && (
        <Select
          value={filter.region_id || ''}
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
