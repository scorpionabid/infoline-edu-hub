
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryFilter } from '@/types/category';

interface CategoryFilterCardProps {
  filter: CategoryFilter;
  setFilter: (filter: Partial<CategoryFilter>) => void;
  onReset?: () => void;
}

const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  filter,
  setFilter,
  onReset,
}) => {
  const { t } = useLanguage();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setFilter({
        status: 'all',
        assignment: 'all',
        deadline: 'all',
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filter.status || 'all'}
              onValueChange={(value) => setFilter({ ...filter, status: value as CategoryFilter['status'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                <SelectItem value="draft">{t('draft')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('assignment')}</label>
            <Select
              value={filter.assignment || 'all'}
              onValueChange={(value) => setFilter({ ...filter, assignment: value as CategoryFilter['assignment'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectAssignment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="all">{t('allSchools')}</SelectItem>
                <SelectItem value="sectors">{t('onlySectors')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('deadline')}</label>
            <Select
              value={filter.deadline || 'all'}
              onValueChange={(value) => setFilter({ ...filter, deadline: value as CategoryFilter['deadline'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectDeadline')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="upcoming">{t('upcoming')}</SelectItem>
                <SelectItem value="past">{t('past')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleReset}>
            {t('resetFilters')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilterCard;
