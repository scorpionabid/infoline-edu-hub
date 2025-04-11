
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Grid3X3, List, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface CategoryHeaderProps {
  onAddCategory: () => void;
  canAddCategory?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (value: 'list' | 'grid') => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  onAddCategory,
  canAddCategory = true,
  searchValue = '',
  onSearchChange,
  viewMode = 'list',
  onViewModeChange
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
      <h1 className="text-2xl font-bold">{t('categories')}</h1>
      
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchCategory')}
            className="pl-8"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as 'list' | 'grid')}>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid3X3 className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        
        {canAddCategory && (
          <Button onClick={onAddCategory}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('addCategory')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CategoryHeader;
