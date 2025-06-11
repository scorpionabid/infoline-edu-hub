
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, X } from 'lucide-react';
import { useCategoryActions } from '@/hooks/categories/useCategoryActions';
import { useRoleBasedReports } from '@/hooks/reports/useRoleBasedReports';

interface ReportHeaderProps {
  onCategorySelect: (categoryId: string) => void;
  onFiltersChange: (filters: any) => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  onCategorySelect,
  onFiltersChange
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError 
  } = useCategoryActions();

  const {
    userRole,
    getPermissionsSummary,
    getFilterOptions
  } = useRoleBasedReports();

  const permissions = getPermissionsSummary();
  const filterOptions = getFilterOptions();

  // Extract permission flags safely
  const canSelectRegion = filterOptions && 'canSelectRegion' in filterOptions 
    ? filterOptions.canSelectRegion 
    : true;
  const canSelectSector = filterOptions && 'canSelectSector' in filterOptions 
    ? filterOptions.canSelectSector 
    : true;
  const canSelectSchool = filterOptions && 'canSelectSchool' in filterOptions 
    ? filterOptions.canSelectSchool 
    : true;

  // Update filters when values change
  useEffect(() => {
    const filters = {
      category_id: selectedCategory,
      region_id: selectedRegion,
      sector_id: selectedSector,
      school_id: selectedSchool,
      search: searchQuery
    };
    onFiltersChange(filters);
  }, [selectedCategory, selectedRegion, selectedSector, selectedSchool, searchQuery, onFiltersChange]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategorySelect(categoryId);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedRegion('');
    setSelectedSector('');
    setSelectedSchool('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedRegion || selectedSector || selectedSchool || searchQuery;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('reportFilters')}</span>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="secondary">
                {[selectedCategory, selectedRegion, selectedSector, selectedSchool, searchQuery]
                  .filter(Boolean).length} filter aktiv
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filterlər
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Təmizlə
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      {showFilters && (
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Axtarış</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  type="search"
                  placeholder="Məktəb, region və ya sektor adı ilə axtar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Label htmlFor="category">Kateqoriya</Label>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Kateqoriya seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Bütün kateqoriyalar</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region Filter */}
            {canSelectRegion && (
              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Region seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Bütün regionlar</SelectItem>
                    {filterOptions && filterOptions.regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sector Filter */}
            {canSelectSector && (
              <div>
                <Label htmlFor="sector">Sektor</Label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="Sektor seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Bütün sektorlar</SelectItem>
                    {filterOptions && filterOptions.sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* School Filter */}
            {canSelectSchool && (
              <div>
                <Label htmlFor="school">Məktəb</Label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Məktəb seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Bütün məktəblər</SelectItem>
                    {filterOptions && filterOptions.schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ReportHeader;
