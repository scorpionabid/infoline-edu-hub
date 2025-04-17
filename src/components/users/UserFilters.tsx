import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Role } from '@/context/auth/types';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { mockRegions, getFilteredSectors, getFilteredSchools } from '@/data/formData';

interface UserFiltersProps {
  filter: UserFilter;
  updateFilter: (filter: Partial<UserFilter>) => void;
  resetFilter: () => void;
  currentUserRole?: Role;
  currentUserRegionId?: string;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filter,
  updateFilter,
  resetFilter,
  currentUserRole,
  currentUserRegionId,
}) => {
  const { t } = useLanguage();
  const [searchValue, setSearchValue] = useState(filter.search || '');
  
  const handleResetFilter = () => {
    setSearchValue('');
    resetFilter();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateFilter({ search: searchValue });
    }
  };

  const availableRegions = React.useMemo(() => {
    if (currentUserRole === 'regionadmin' && currentUserRegionId) {
      return mockRegions.filter(region => region.id === currentUserRegionId);
    }
    return mockRegions;
  }, [currentUserRole, currentUserRegionId]);

  const filteredSectors = React.useMemo(() => {
    return getFilteredSectors(filter.region);
  }, [filter.region]);

  const filteredSchools = React.useMemo(() => {
    return getFilteredSchools(filter.sector);
  }, [filter.sector]);

  const isRegionFilterDisabled = currentUserRole === 'regionadmin';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchUsers')}
              className="pl-8"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchValue && (
              <button
                type="button"
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearchValue('');
                  updateFilter({ search: '' });
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t('clear')}</span>
              </button>
            )}
          </div>

          <Select
            value={filter.role || "all"}
            onValueChange={(value: string) => {
              const roleValue = value === "all" ? undefined : value as Role;
              updateFilter({ role: roleValue });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectRole')} />
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
            value={filter.status || "all"}
            onValueChange={(value) => updateFilter({ status: value === "all" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="blocked">{t('blocked')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.region || "all"}
            onValueChange={(value) => {
              updateFilter({ 
                region: value === "all" ? undefined : value,
                sector: undefined,
                school: undefined
              });
            }}
            disabled={isRegionFilterDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectRegion')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allRegions')}</SelectItem>
              {availableRegions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleResetFilter}
            className="flex items-center justify-center"
          >
            <X className="mr-2 h-4 w-4" />
            {t('resetFilters')}
          </Button>
        </div>

        {(filter.region || filter.sector) && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {filter.region && (
              <Select
                value={filter.sector || "all"}
                onValueChange={(value) => {
                  updateFilter({ 
                    sector: value === "all" ? undefined : value,
                    school: undefined
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSector')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allSectors')}</SelectItem>
                  {filteredSectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filter.sector && (
              <Select
                value={filter.school || "all"}
                onValueChange={(value) => updateFilter({ school: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSchool')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allSchools')}</SelectItem>
                  {filteredSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserFilters;
