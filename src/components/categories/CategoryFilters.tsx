
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryFilter } from '@/types/dataEntry';

interface CategoryFiltersProps {
  filters: CategoryFilter;
  onFiltersChange: (filters: CategoryFilter) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { t } = useLanguage();
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: localSearch });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      status: '',
      assignment: '',
      archived: false,
      showArchived: false,
      search: ''
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchCategories')}
            value={localSearch}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        <Button type="submit">{t('search')}</Button>
        {(filters.status || filters.assignment || filters.showArchived || filters.search) && (
          <Button variant="ghost" onClick={clearFilters} type="button">
            <X className="mr-2 h-4 w-4" />
            {t('clearFilters')}
          </Button>
        )}
      </form>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('all')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select
            value={filters.assignment}
            onValueChange={(value) => onFiltersChange({ ...filters, assignment: value as 'all' | 'sectors' | '' })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filterByAssignment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('all')}</SelectItem>
              <SelectItem value="all">{t('assignment.all')}</SelectItem>
              <SelectItem value="sectors">{t('assignment.sectors')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="show-archived"
            checked={filters.showArchived}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, showArchived: checked })}
          />
          <Label htmlFor="show-archived">{t('showArchived')}</Label>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;
