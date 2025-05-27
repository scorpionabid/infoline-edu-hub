import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Region, Sector } from '@/types/supabase';
import { useLanguageSafe } from '@/context/LanguageContext';

interface SchoolFiltersContainerProps {
  searchTerm: string;
  regionFilter: string;
  sectorFilter: string;
  statusFilter: string;
  regions: Region[];
  sectors: Sector[];
  setSearchTerm: (term: string) => void;
  setRegionFilter: (regionId: string) => void;
  setSectorFilter: (sectorId: string) => void;
  setStatusFilter: (status: string) => void;
  resetFilters: () => void;
}

const SchoolFiltersContainer: React.FC<SchoolFiltersContainerProps> = ({
  searchTerm,
  regionFilter,
  sectorFilter,
  statusFilter,
  regions,
  sectors,
  setSearchTerm,
  setRegionFilter,
  setSectorFilter,
  setStatusFilter,
  resetFilters
}) => {
  const { t } = useLanguageSafe();
  
  // Seçilmiş regionun sektorlarını filtrlə
  const filteredSectors = regionFilter === 'all'
    ? sectors
    : sectors.filter(sector => sector.region_id === regionFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        {/* Axtarış */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchSchools')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs sm:text-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Region filter */}
        <div className="w-full sm:w-auto">
          <Select
            value={regionFilter}
            onValueChange={setRegionFilter}
          >
            <SelectTrigger className="w-full text-xs sm:text-sm">
              <SelectValue placeholder={t('allRegions')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allRegions')}</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>{region.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Sector filter */}
        <div className="w-full sm:w-auto">
          <Select
            value={sectorFilter}
            onValueChange={setSectorFilter}
            disabled={filteredSectors.length === 0}
          >
            <SelectTrigger className="w-full text-xs sm:text-sm">
              <SelectValue placeholder={t('allSectors')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allSectors')}</SelectItem>
              {filteredSectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Status filter */}
        <div className="w-full sm:w-auto">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full text-xs sm:text-sm">
              <SelectValue placeholder={t('allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Reset filters */}
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="text-xs sm:text-sm"
          disabled={(searchTerm === '' && regionFilter === 'all' && sectorFilter === 'all' && statusFilter === 'all')}
        >
          <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          {t('resetFilters')}
        </Button>
      </div>
    </div>
  );
};

export default SchoolFiltersContainer;
