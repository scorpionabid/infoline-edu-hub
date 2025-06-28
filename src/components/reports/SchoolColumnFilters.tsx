
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
import { Search, Filter, RotateCcw } from 'lucide-react';
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
  permissions
}) => {
  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Məktəb Axtar:
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            id="search"
            type="search"
            placeholder="Məktəb adı ilə axtar..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange('searchQuery', e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Filters Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Region Filter */}
        {!permissions?.restrictions.region_id && (
          <div className="space-y-2">
            <Label htmlFor="region" className="text-sm font-medium">
              Region:
            </Label>
            <Select 
              value={filters.selectedRegion} 
              onValueChange={(value) => onFilterChange('selectedRegion', value)}
            >
              <SelectTrigger id="region" className="w-full">
                <SelectValue placeholder="Bütün Regionlar" />
              </SelectTrigger>
              <SelectContent className="z-50">
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
          <div className="space-y-2">
            <Label htmlFor="sector" className="text-sm font-medium">
              Sektor:
            </Label>
            <Select 
              value={filters.selectedSector} 
              onValueChange={(value) => onFilterChange('selectedSector', value)}
            >
              <SelectTrigger id="sector" className="w-full">
                <SelectValue placeholder="Bütün Sektorlar" />
              </SelectTrigger>
              <SelectContent className="z-50">
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

        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Kateqoriya:
          </Label>
          <Select 
            value={filters.selectedCategory} 
            onValueChange={(value) => onFilterChange('selectedCategory', value)}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Kateqoriya Seçin" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">Bütün Kateqoriyalar</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Size */}
        <div className="space-y-2">
          <Label htmlFor="pageSize" className="text-sm font-medium">
            Səhifə Ölçüsü:
          </Label>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger id="pageSize" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        <Button 
          onClick={onResetFilters} 
          variant="outline" 
          className="w-full sm:w-auto"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Filtrleri Sıfırla
        </Button>
      </div>
    </div>
  );
};

export default SchoolColumnFilters;
