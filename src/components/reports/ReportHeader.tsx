import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';
import { useRoleBasedFilters } from '@/hooks/reports/useRoleBasedReports';

interface ReportHeaderProps {
  onCategorySelect: (categoryId: string) => void;
  onFiltersChange: (filters: any) => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  onCategorySelect,
  onFiltersChange
}) => {
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const { categories, isLoading: categoriesLoading } = useCategories();

  const {
    availableRegions,
    availableSectors, 
    availableSchools,
    filterOptions = { canSelectRegion: true, canSelectSector: true, canSelectSchool: true }
  } = useRoleBasedFilters();

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
    onFiltersChange({ region_id: regionId });
  };

  const handleSectorSelect = (sectorId: string) => {
    setSelectedSector(sectorId);
    onFiltersChange({ sector_id: sectorId });
  };

  const handleSchoolSelect = (schoolId: string) => {
    setSelectedSchool(schoolId);
    onFiltersChange({ school_id: schoolId });
  };

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reports')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Region Filter */}
          {filterOptions.canSelectRegion && (
            <div className="space-y-2">
              <Select onValueChange={handleRegionSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filterByRegion')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('allRegions')}</SelectItem>
                  {availableRegions && availableRegions.map((region) => (
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
            <div className="space-y-2">
              <Select onValueChange={handleSectorSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filterBySector')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('allSectors')}</SelectItem>
                  {availableSectors && availableSectors.map((sector) => (
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
            <div className="space-y-2">
              <Select onValueChange={handleSchoolSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filterBySchool')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('allSchools')}</SelectItem>
                  {availableSchools && availableSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Category Filter */}
          <div className="space-y-2">
            <Select onValueChange={handleCategorySelect}>
              <SelectTrigger>
                <SelectValue placeholder={t('filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allCategories')}</SelectItem>
                {!categoriesLoading && categories ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    {t('loading')}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportHeader;
