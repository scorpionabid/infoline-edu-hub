
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { FILTER_VALUES } from '@/lib/constants';

interface SchoolFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  regions: any[];
  sectors: any[];
  loadingRegions: boolean;
  loadingSectors: boolean;
}

export const SchoolFilters: React.FC<SchoolFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedRegion,
  setSelectedRegion,
  selectedSector,
  setSelectedSector,
  regions,
  sectors,
  loadingRegions,
  loadingSectors
}) => {
  // Handle region change with proper empty value handling
  const handleRegionChange = (value: string) => {
    const actualValue = value === FILTER_VALUES.ALL_REGIONS ? '' : value;
    setSelectedRegion(actualValue);
  };

  // Handle sector change with proper empty value handling  
  const handleSectorChange = (value: string) => {
    const actualValue = value === FILTER_VALUES.ALL_SECTORS ? '' : value;
    setSelectedSector(actualValue);
  };

  // Ensure safe values for Select components
  const safeSelectedRegion = selectedRegion || FILTER_VALUES.ALL_REGIONS;
  const safeSelectedSector = selectedSector || FILTER_VALUES.ALL_SECTORS;
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Məktəb axtar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={safeSelectedRegion} onValueChange={handleRegionChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Rayon seç" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FILTER_VALUES.ALL_REGIONS}>Bütün rayonlar</SelectItem>
          {!loadingRegions && regions.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={safeSelectedSector} onValueChange={handleSectorChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Sektor seç" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FILTER_VALUES.ALL_SECTORS}>Bütün sektorlar</SelectItem>
          {!loadingSectors && sectors.map((sector) => (
            <SelectItem key={sector.id} value={sector.id}>
              {sector.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SchoolFilters;
