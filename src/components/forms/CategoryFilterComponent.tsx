
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryFilter, CategoryFilterProps } from '@/types/category';

interface ExtendedCategoryFilterProps {
  filters: CategoryFilter;
  onChange: (filters: Partial<CategoryFilter>) => void;
  showAssignmentFilter?: boolean;
}

const CategoryFilterComponent: React.FC<ExtendedCategoryFilterProps> = ({ 
  filters, 
  onChange, 
  showAssignmentFilter = false 
}) => {
  const { t } = useLanguage();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    onChange({ ...filters, status: value || null });
  };

  const handleAssignmentChange = (value: string) => {
    onChange({ ...filters, assignment: value || null });
  };

  const handleSortChange = (field: string) => {
    // Only add if filters supports sortBy
    if ('sortBy' in filters) {
      const currentSortOrder = filters.sortOrder || 'asc';
      const newSortOrder = filters.sortBy === field && currentSortOrder === 'asc' ? 'desc' : 'asc';
      
      onChange({ 
        ...filters, 
        sortBy: field,
        sortOrder: newSortOrder
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <Input
          placeholder={t('searchCategories')}
          value={filters.search || ''}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>
      <div className="w-full md:w-48">
        <Select
          value={filters.status || ''}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('all')}</SelectItem>
            <SelectItem value="active">{t('active')}</SelectItem>
            <SelectItem value="inactive">{t('inactive')}</SelectItem>
            <SelectItem value="archived">{t('archived')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {showAssignmentFilter && (
        <div className="w-full md:w-48">
          <Select
            value={filters.assignment || ''}
            onValueChange={handleAssignmentChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('assignment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('all')}</SelectItem>
              <SelectItem value="all">{t('allEntities')}</SelectItem>
              <SelectItem value="sectors">{t('sectors')}</SelectItem>
              <SelectItem value="schools">{t('schools')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterComponent;
