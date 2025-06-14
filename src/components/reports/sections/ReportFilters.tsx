import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from 'lucide-react';

interface ReportFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  selectedSector: string;
  onSectorChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  regions: any[];
  sectors: any[];
  categories: any[];
  permissions?: {
    restrictions: {
      region_id?: string;
      sector_id?: string;
      school_id?: string;
    };
  } | null;
  onReset: () => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedSector,
  onSectorChange,
  selectedCategory,
  onCategoryChange,
  regions,
  sectors,
  categories,
  permissions,
  onReset
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
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Region Filter */}
        {!permissions?.restrictions.region_id && (
          <div>
            <Label htmlFor="region">Region:</Label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
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
            <Select value={selectedSector} onValueChange={onSectorChange}>
              <SelectTrigger id="sector">
                <SelectValue placeholder="Bütün Sektorlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün Sektorlar</SelectItem>
                {sectors
                  .filter((sector: any) => !selectedRegion || selectedRegion === 'all' || sector.region_id === selectedRegion)
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

      {/* Second row: Category selection and Reset button */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div>
          <Label htmlFor="category">Kateqoriya:</Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
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
        
        {/* Reset Button */}
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="w-full"
          >
            Filtrləri Sıfırla
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;