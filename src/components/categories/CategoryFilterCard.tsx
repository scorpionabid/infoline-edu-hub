
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryFilter } from '@/types/dataEntry';

export interface CategoryFilterCardProps {
  filters: CategoryFilter;
  onFilterChange: (filterName: keyof CategoryFilter, value: string | boolean) => void;
  onResetFilters: () => void;
  showLoading?: boolean;
}

const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  showLoading = false
}) => {
  const { t } = useLanguage();
  
  // Hər hansı filtr aktiv olduqda true qaytarır
  const hasActiveFilters = 
    filters.status !== undefined || 
    filters.assignment !== undefined || 
    filters.search !== '' || 
    filters.showArchived;

  if (showLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('filters')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>{t('status')}</Label>
          <RadioGroup 
            value={filters.status || ''}
            onValueChange={(value) => onFilterChange('status', value || undefined)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="status-all" />
              <Label htmlFor="status-all">{t('all')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="status-active" />
              <Label htmlFor="status-active">{t('active')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inactive" id="status-inactive" />
              <Label htmlFor="status-inactive">{t('inactive')}</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label>{t('assignment')}</Label>
          <RadioGroup 
            value={filters.assignment || ''}
            onValueChange={(value) => {
              if (value === '') {
                onFilterChange('assignment', undefined);
              } else {
                onFilterChange('assignment', value as 'all' | 'sectors');
              }
            }}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="assignment-all" />
              <Label htmlFor="assignment-all">{t('all')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="assignment-general" />
              <Label htmlFor="assignment-general">{t('general')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sectors" id="assignment-sectors" />
              <Label htmlFor="assignment-sectors">{t('sectors')}</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder={t('searchCategories')}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
            {filters.search && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1.5 h-5 w-5" 
                onClick={() => onFilterChange('search', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-archived" 
            checked={filters.showArchived}
            onCheckedChange={(checked) => onFilterChange('showArchived', checked === true)}
          />
          <Label htmlFor="show-archived">{t('showArchivedCategories')}</Label>
        </div>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onResetFilters}
            className="w-full text-sm"
          >
            {t('resetFilters')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryFilterCard;
