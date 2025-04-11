
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface CategoryFilterCardProps {
  searchValue?: string; // Added
  onSearchChange?: (value: string) => void; // Added
}

const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  searchValue = '',
  onSearchChange
}) => {
  const { t } = useLanguage();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('filterCategories')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              {t('searchByKeyword')}
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchCategory')}
                className="pl-8"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilterCard;
