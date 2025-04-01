
import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Region } from '@/types/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SchoolFiltersProps {
  searchTerm: string;
  selectedRegion: string;
  selectedSector: string;
  selectedStatus: string;
  filteredSectors: {
    id: string;
    name: string;
    regionId: string;
  }[];
  regions: Region[];
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRegionFilter: (value: string) => void;
  handleSectorFilter: (value: string) => void;
  handleStatusFilter: (value: string) => void;
  resetFilters: () => void;
}

const SchoolFilters: React.FC<SchoolFiltersProps> = ({
  searchTerm,
  selectedRegion,
  selectedSector,
  selectedStatus,
  filteredSectors,
  regions,
  handleSearch,
  handleRegionFilter,
  handleSectorFilter,
  handleStatusFilter,
  resetFilters
}) => {
  const { t } = useLanguage();
  const hasActiveFilters = searchTerm || selectedRegion || selectedSector || selectedStatus;

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchSchools')}
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1.5 h-5 w-5" 
              onClick={() => handleSearch({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div>
          <Select 
            value={selectedRegion || 'all'} 
            onValueChange={handleRegionFilter}
          >
            <SelectTrigger aria-label={t('filterByRegion')}>
              <SelectValue placeholder={t('allRegions')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allRegions')}</SelectItem>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            value={selectedSector || 'all'} 
            onValueChange={handleSectorFilter} 
            disabled={!selectedRegion && filteredSectors.length === 0}
          >
            <SelectTrigger aria-label={t('filterBySector')}>
              <SelectValue placeholder={t('allSectors')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allSectors')}</SelectItem>
              {filteredSectors.map(sector => (
                <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            value={selectedStatus || 'all'} 
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger aria-label={t('filterByStatus')}>
              <SelectValue placeholder={t('allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters}
            className="text-sm flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            {t('resetFilters')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SchoolFilters;
