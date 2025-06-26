import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from 'lucide-react';
import { FilterState } from '@/hooks/reports/useSchoolColumnFilters';

interface SchoolColumnFiltersProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  regions: any[];
  sectors: any[];
  categories: any[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  permissions?: {
    restrictions: {
      region_id?: string;
      sector_id?: string;
    };
  };
}

const SchoolColumnFilters: React.FC<SchoolColumnFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  regions,
  sectors,
  categories,
  pageSize,
  onPageSizeChange,
  // permissions
}) => {
  return (
    <div className="space-y-4">
      {/* Top row: Basic filters */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <div className="col-span-1 md:col-span-2">
          <Label htmlFor="search">Məktəb Axtar:</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="Məktəb adı ilə axtar..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Region Filter */}
        {!permissions?.restrictions.region_id && (
          <div>
            <Label htmlFor="region">Region:</Label>
            <Select value={filters.selectedRegion} onValueChange={(value) => onFilterChange('selectedRegion', value)}>
              <SelectTrigger id="region">
                <SelectValue placeholder="Bütün Regionlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Regionlar</SelectItem>
                {regions.map((region: any) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sector Filter */}
        {!permissions?.restrictions.sector_id && (
          <div>
            <Label htmlFor="sector">Sektor:</Label>
            <Select value={filters.selectedSector} onValueChange={(value) => onFilterChange('selectedSector', value)}>
              <SelectTrigger id="sector">
                <SelectValue placeholder="Bütün Sektorlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Sektorlar</SelectItem>
                {sectors
                  .filter((sector: any) => 
                    !filters.selectedRegion || 
                    filters.selectedRegion === 'all' || 
                    sector.region_id === filters.selectedRegion
                  )
                  .map((sector: any) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Second row: Category selection, Page Size and Reset button */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <div>
          <Label htmlFor="category">Kateqoriya:</Label>
          <Select value={filters.selectedCategory} onValueChange={(value) => onFilterChange('selectedCategory', value)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Kateqoriya seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün Kateqoriyalar</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Page Size Selector */}
        <div>
          <Label htmlFor="pageSize">Səhifə ölçüsü:</Label>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger id="pageSize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 məktəb</SelectItem>
              <SelectItem value="25">25 məktəb</SelectItem>
              <SelectItem value="50">50 məktəb</SelectItem>
              <SelectItem value="100">100 məktəb</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Reset Button */}
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            className="w-full"
          >
            Filtrləri Sıfırla
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SchoolColumnFilters;
