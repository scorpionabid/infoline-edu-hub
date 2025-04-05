
import React, { useState } from 'react';
import { UserFilter } from '@/hooks/useUserList';
import { useLanguage } from '@/context/LanguageContext';
import { Role } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  
  // Filtrlər sıfırlandıqda axtarış dəyərini də sıfırla
  const handleResetFilter = () => {
    setSearchValue('');
    resetFilter();
  };

  // Axtarış üçün enter düyməsi ilə təsdiqləmə
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateFilter({ search: searchValue });
    }
  };

  // İstifadəçinin roluna əsasən mövcud regionları əldə etmək
  const availableRegions = React.useMemo(() => {
    if (currentUserRole === 'regionadmin' && currentUserRegionId) {
      return mockRegions.filter(region => region.id === currentUserRegionId);
    }
    return mockRegions;
  }, [currentUserRole, currentUserRegionId]);

  // Region seçiminə əsasən sektorları filtrləmək
  const filteredSectors = React.useMemo(() => {
    return getFilteredSectors(filter.region);
  }, [filter.region]);

  // Sektor seçiminə əsasən məktəbləri filtrləmək
  const filteredSchools = React.useMemo(() => {
    return getFilteredSchools(filter.sector);
  }, [filter.sector]);

  // Region admin olduqda region filtri deaktiv olmalıdır
  const isRegionFilterDisabled = currentUserRole === 'regionadmin';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Axtarış */}
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

          {/* Rol filtri */}
          <Select
            value={filter.role || ""}
            onValueChange={(value: string) => {
              // Burada düzəliş: Əgər boş string gəlirsə, undefined təyin edirik
              // Əks halda, value dəyərini Role tipinə çeviririk
              const roleValue = value ? value as Role : undefined;
              updateFilter({ role: roleValue });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectRole')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('allRoles')}</SelectItem>
              <SelectItem value="superadmin">{t('superadmin')}</SelectItem>
              <SelectItem value="regionadmin">{t('regionadmin')}</SelectItem>
              <SelectItem value="sectoradmin">{t('sectoradmin')}</SelectItem>
              <SelectItem value="schooladmin">{t('schooladmin')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filtri */}
          <Select
            value={filter.status || ""}
            onValueChange={(value) => updateFilter({ status: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="blocked">{t('blocked')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Region filtri */}
          <Select
            value={filter.region || ""}
            onValueChange={(value) => {
              updateFilter({ 
                region: value || undefined,
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
              <SelectItem value="">{t('allRegions')}</SelectItem>
              {availableRegions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Təmizləmə düyməsi */}
          <Button
            variant="outline"
            onClick={handleResetFilter}
            className="flex items-center justify-center"
          >
            <X className="mr-2 h-4 w-4" />
            {t('resetFilters')}
          </Button>
        </div>

        {/* Əlavə filtrlər (Sektor və Məktəb) */}
        {(filter.region || filter.sector) && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Sektor filtri */}
            {filter.region && (
              <Select
                value={filter.sector || ""}
                onValueChange={(value) => {
                  updateFilter({ 
                    sector: value || undefined,
                    school: undefined
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSector')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('allSectors')}</SelectItem>
                  {filteredSectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Məktəb filtri */}
            {filter.sector && (
              <Select
                value={filter.school || ""}
                onValueChange={(value) => updateFilter({ school: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSchool')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('allSchools')}</SelectItem>
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
