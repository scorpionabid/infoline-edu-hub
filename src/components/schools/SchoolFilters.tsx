
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

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
      
      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Rayon seç" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Bütün rayonlar</SelectItem>
          {!loadingRegions && regions.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedSector} onValueChange={setSelectedSector}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Sektor seç" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Bütün sektorlar</SelectItem>
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
