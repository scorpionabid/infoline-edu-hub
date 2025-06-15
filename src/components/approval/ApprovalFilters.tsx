
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntryStatus } from '@/types/dataEntry';

interface ApprovalFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  schoolFilter: string;
  onSchoolFilterChange: (school: string) => void;
  onClearFilters: () => void;
  categories?: Array<{ id: string; name: string }>;
  schools?: Array<{ id: string; name: string }>;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  schoolFilter,
  onSchoolFilterChange,
  onClearFilters,
  categories = [],
  schools = [],
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { t } = useLanguage();

  const statusOptions: Array<{ value: string; label: string }> = [
    { value: 'all', label: t('allStatuses') },
    { value: 'pending', label: t('pending') },
    { value: 'approved', label: t('approved') },
    { value: 'rejected', label: t('rejected') },
    { value: 'requires_revision', label: t('requiresRevision') }
  ];

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || categoryFilter || schoolFilter;

  if (isCollapsed) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">{t('filters')}</span>
              {hasActiveFilters && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  {t('activeFilters')}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              {t('showFilters')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t('filterAndSearch')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <X className="w-4 h-4 mr-1" />
                {t('clearFilters')}
              </Button>
            )}
            {onToggleCollapse && (
              <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
                {t('hideFilters')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <Label htmlFor="search">{t('search')}</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <Label htmlFor="status-filter">{t('status')}</Label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Label htmlFor="category-filter">{t('category')}</Label>
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* School Filter */}
          <div>
            <Label htmlFor="school-filter">{t('school')}</Label>
            <Select value={schoolFilter} onValueChange={onSchoolFilterChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t('selectSchool')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSchools')}</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalFilters;
