import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { FILTER_VALUES } from '@/lib/constants';
import { FilterOptions } from '@/hooks/common/useEnhancedPagination';
import { getFilterableStatuses } from '@/utils/schoolUtils';

interface SchoolFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  regions: any[];
  sectors: any[];
  loadingRegions: boolean;
  loadingSectors: boolean;
}

export const SchoolFilters: React.FC<SchoolFiltersProps> = ({
  filters,
  onFilterChange,
  regions,
  sectors,
  loadingRegions,
  loadingSectors
}) => {
  // Handle search change
  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  // Handle region change
  const handleRegionChange = (value: string) => {
    const regionId = value === FILTER_VALUES.ALL_REGIONS ? '' : value;
    onFilterChange({ ...filters, regionId });
  };

  // Handle sector change
  const handleSectorChange = (value: string) => {
    const sectorId = value === FILTER_VALUES.ALL_SECTORS ? '' : value;
    onFilterChange({ ...filters, sectorId });
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    const status = value === 'ALL_STATUSES' ? '' : value;
    onFilterChange({ ...filters, status });
  };

  // Ensure safe values for Select components
  const safeSelectedRegion = filters.regionId || FILTER_VALUES.ALL_REGIONS;
  const safeSelectedSector = filters.sectorId || FILTER_VALUES.ALL_SECTORS;
  const safeSelectedStatus = filters.status || 'ALL_STATUSES';

  // Get filterable statuses
  const statusOptions = getFilterableStatuses();

  return (
    <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:gap-4 mb-6">
      {/* Search Input - Full width on mobile */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
        <Input
          placeholder="Məktəb axtar..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      
      {/* Filters Container - Responsive grid */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 sm:flex-shrink-0">
        {/* Region Select */}
        <div className="w-full sm:w-48">
          <Select value={safeSelectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Rayon seç" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value={FILTER_VALUES.ALL_REGIONS}>Bütün rayonlar</SelectItem>
              {!loadingRegions && regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sector Select */}
        <div className="w-full sm:w-48">
          <Select value={safeSelectedSector} onValueChange={handleSectorChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sektor seç" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value={FILTER_VALUES.ALL_SECTORS}>Bütün sektorlar</SelectItem>
              {!loadingSectors && sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Select */}
        <div className="w-full sm:w-40">
          <Select value={safeSelectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status seç" />
            </SelectTrigger>
            <SelectContent className="z-50">
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SchoolFilters;