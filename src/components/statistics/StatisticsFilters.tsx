
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, X } from 'lucide-react';
import { StatisticsFilters as IStatisticsFilters } from '@/services/statisticsService';

interface StatisticsFiltersProps {
  filters: IStatisticsFilters;
  onFiltersChange: (filters: IStatisticsFilters) => void;
  onResetFilters: () => void;
  availableRegions?: Array<{ id: string; name: string }>;
  availableSectors?: Array<{ id: string; name: string }>;
  availableCategories?: Array<{ id: string; name: string }>;
  userRole?: string;
}

export const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  availableRegions = [],
  availableSectors = [],
  availableCategories = [],
  // userRole
}) => {
  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleFilterChange = (key: keyof IStatisticsFilters, value: string) => {
    if (value === 'all' || !value) {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    } else {
      onFiltersChange({
        ...filters,
        [key]: value
      });
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filtrlər
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Təmizlə
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tarix aralığı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Başlanğıc tarixi</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="startDate"
                type="date"
                value={filters.dateRange?.startDate?.split('T')[0] || ''}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Bitmə tarixi</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="endDate"
                type="date"
                value={filters.dateRange?.endDate?.split('T')[0] || ''}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Region seçimi (yalnız SuperAdmin üçün) */}
        {userRole === 'superadmin' && availableRegions.length > 0 && (
          <div className="space-y-2">
            <Label>Region</Label>
            <Select
              value={filters.regionId || 'all'}
              onValueChange={(value) => handleFilterChange('regionId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Region seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün regionlar</SelectItem>
                {availableRegions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sektor seçimi (SuperAdmin və RegionAdmin üçün) */}
        {['superadmin', 'regionadmin'].includes(userRole || '') && availableSectors.length > 0 && (
          <div className="space-y-2">
            <Label>Sektor</Label>
            <Select
              value={filters.sectorId || 'all'}
              onValueChange={(value) => handleFilterChange('sectorId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sektor seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün sektorlar</SelectItem>
                {availableSectors.map((sector) => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Kateqoriya seçimi */}
        {availableCategories.length > 0 && (
          <div className="space-y-2">
            <Label>Kateqoriya</Label>
            <Select
              value={filters.categoryId || 'all'}
              onValueChange={(value) => handleFilterChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kateqoriya seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bütün kateqoriyalar</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status seçimi */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bütün statuslar</SelectItem>
              <SelectItem value="pending">Gözləyir</SelectItem>
              <SelectItem value="approved">Təsdiqləndi</SelectItem>
              <SelectItem value="rejected">Rədd edildi</SelectItem>
              <SelectItem value="draft">Qaralama</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsFilters;
