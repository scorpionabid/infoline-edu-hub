
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { UserFilter } from '@/types/user';
import { useLanguage } from '@/context/LanguageContext';

interface UserHeaderProps {
  onCreateUser: () => void;
  onExport: () => void;
  filter: UserFilter;
  onFilterChange: (filter: Partial<UserFilter>) => void;
  regions: Array<{ id: string; name: string }>;
  sectors: Array<{ id: string; name: string }>;
  schools: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  onCreateUser,
  onExport,
  filter,
  onFilterChange,
  regions,
  sectors,
  schools,
  isLoading = false
}) => {
  const { t } = useLanguage();

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      region: '',
      sector: '',
      school: '',
      role: '',
      status: ''
    });
  };

  const hasActiveFilters = Boolean(
    filter.search || filter.region || filter.sector || filter.school || filter.role || filter.status
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('users')}</h1>
          <p className="text-muted-foreground">{t('manageSystemUsers')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
          <Button onClick={onCreateUser} disabled={isLoading}>
            <Plus className="h-4 w-4 mr-2" />
            {t('createUser')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchUsers')}
              value={filter.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <Select
          value={filter.region || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              onFilterChange({ region: '' });
            } else {
              onFilterChange({ region: value });
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('allRegions')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allRegions')}</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.sector || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              onFilterChange({ sector: '' });
            } else {
              onFilterChange({ sector: value });
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('allSectors')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allSectors')}</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.school || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              onFilterChange({ school: '' });
            } else {
              onFilterChange({ school: value });
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('allSchools')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allSchools')}</SelectItem>
            {schools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filter.role || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              onFilterChange({ role: '' });
            } else {
              onFilterChange({ role: value });
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('allRoles')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allRoles')}</SelectItem>
            <SelectItem value="superadmin">{t('superadmin')}</SelectItem>
            <SelectItem value="regionadmin">{t('regionadmin')}</SelectItem>
            <SelectItem value="sectoradmin">{t('sectoradmin')}</SelectItem>
            <SelectItem value="schooladmin">{t('schooladmin')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.status || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              onFilterChange({ status: '' });
            } else {
              onFilterChange({ status: value });
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatuses')}</SelectItem>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="inactive">{t('inactive')}</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('clearFilters')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserHeader;
