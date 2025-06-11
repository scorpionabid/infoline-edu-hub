
import React, { useState, useEffect } from 'react';
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
import { Filter, Download, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCategoryActions } from '@/hooks/categories/useCategoryActions';
import { useRoleBasedReports } from '@/hooks/reports/useRoleBasedReports';

interface ReportHeaderProps {
  title: string;
  description?: string;
  onFiltersChange?: (filters: any) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  showFilters?: boolean;
  showExport?: boolean;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  description,
  onFiltersChange,
  onRefresh,
  onExport,
  showFilters = true,
  showExport = true
}) => {
  const { t } = useLanguage();
  const { categories, isLoading: categoriesLoading } = useCategoryActions();
  const { getFilterOptions } = useRoleBasedReports();
  
  const [filters, setFilters] = useState({
    region_id: '',
    sector_id: '',
    school_id: '',
    category_id: '',
    search: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    sectors: [],
    schools: [],
    canSelectRegion: true,
    canSelectSector: true,
    canSelectSchool: true
  });

  useEffect(() => {
    const options = getFilterOptions();
    setFilterOptions(options);
  }, [getFilterOptions]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              {description && (
                <p className="text-muted-foreground mt-2">{description}</p>
              )}
            </div>
            <div className="flex gap-2">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('refresh')}
                </Button>
              )}
              {showExport && onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('export')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label htmlFor="search">{t('search')}</Label>
                <Input
                  id="search"
                  placeholder={t('searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Region Filter */}
              {filterOptions.canSelectRegion && (
                <div>
                  <Label htmlFor="region">{t('region')}</Label>
                  <Select 
                    value={filters.region_id} 
                    onValueChange={(value) => handleFilterChange('region_id', value)}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder={t('allRegions')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('allRegions')}</SelectItem>
                      {filterOptions.regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sector Filter */}
              {filterOptions.canSelectSector && (
                <div>
                  <Label htmlFor="sector">{t('sector')}</Label>
                  <Select 
                    value={filters.sector_id} 
                    onValueChange={(value) => handleFilterChange('sector_id', value)}
                  >
                    <SelectTrigger id="sector">
                      <SelectValue placeholder={t('allSectors')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('allSectors')}</SelectItem>
                      {filterOptions.sectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* School Filter */}
              {filterOptions.canSelectSchool && (
                <div>
                  <Label htmlFor="school">{t('school')}</Label>
                  <Select 
                    value={filters.school_id} 
                    onValueChange={(value) => handleFilterChange('school_id', value)}
                  >
                    <SelectTrigger id="school">
                      <SelectValue placeholder={t('allSchools')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('allSchools')}</SelectItem>
                      {filterOptions.schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category Filter */}
              <div>
                <Label htmlFor="category">{t('category')}</Label>
                <Select 
                  value={filters.category_id} 
                  onValueChange={(value) => handleFilterChange('category_id', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={t('allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('allCategories')}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ReportHeader;
