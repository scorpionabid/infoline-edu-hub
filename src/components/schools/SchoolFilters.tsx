
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockRegions, mockSectors, Region, Sector } from '@/data/schoolsData';

interface SchoolFiltersProps {
  searchTerm: string;
  selectedRegion: string;
  selectedSector: string;
  selectedStatus: string;
  filteredSectors: Sector[];
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
  handleSearch,
  handleRegionFilter,
  handleSectorFilter,
  handleStatusFilter,
  resetFilters
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Məktəbləri axtar..."
          className="pl-8"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      <div>
        <select
          value={selectedRegion}
          onChange={handleRegionFilter}
          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">Bütün regionlar</option>
          {mockRegions.map(region => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <select
          value={selectedSector}
          onChange={handleSectorFilter}
          disabled={!selectedRegion}
          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">Bütün sektorlar</option>
          {filteredSectors.map(sector => (
            <option key={sector.id} value={sector.id}>{sector.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <select
          value={selectedStatus}
          onChange={handleStatusFilter}
          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">Bütün statuslar</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Deaktiv</option>
        </select>
      </div>
      
      <div>
        <Button variant="outline" onClick={resetFilters} className="w-full">
          Filtrləri sıfırla
        </Button>
      </div>
    </div>
  );
};

export default SchoolFilters;
