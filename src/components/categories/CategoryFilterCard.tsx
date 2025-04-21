
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryFilter } from '@/types/category';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CategoryFilterCardProps {
  filter: CategoryFilter;
  onFilterChange: (newFilter: Partial<CategoryFilter>) => void;
}

const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  filter,
  onFilterChange
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('status')}</Label>
          <Select
            value={filter.status || 'all'}
            onValueChange={(value) => onFilterChange({ status: value as CategoryFilter['status'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="draft">{t('draft')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>{t('assignment')}</Label>
          <Select
            value={filter.assignment || 'all'}
            onValueChange={(value) => onFilterChange({ assignment: value as CategoryFilter['assignment'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allAssignments')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allAssignments')}</SelectItem>
              <SelectItem value="sectors">{t('onlySectors')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('deadline')}</Label>
          <Select
            value={filter.deadline || 'all'}
            onValueChange={(value) => onFilterChange({ deadline: value as CategoryFilter['deadline'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allDeadlines')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allDeadlines')}</SelectItem>
              <SelectItem value="upcoming">{t('upcomingDeadlines')}</SelectItem>
              <SelectItem value="past">{t('pastDeadlines')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilterCard;
