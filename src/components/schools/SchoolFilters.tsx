
import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Region } from '@/types/supabase';
import { useLanguage } from '@/context/LanguageContext';

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
  handleRegionFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSectorFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleStatusFilter: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
          <select
            value={selectedRegion}
            onChange={handleRegionFilter}
            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t('filterByRegion')}
          >
            <option value="">{t('allRegions')}</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <select
            value={selectedSector}
            onChange={handleSectorFilter}
            disabled={!selectedRegion && filteredSectors.length === 0}
            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t('filterBySector')}
          >
            <option value="">{t('allSectors')}</option>
            {filteredSectors.map(sector => (
              <option key={sector.id} value={sector.id}>{sector.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <select
            value={selectedStatus}
            onChange={handleStatusFilter}
            className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={t('filterByStatus')}
          >
            <option value="">{t('allStatuses')}</option>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>
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
