
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryFilterCardProps {
  filters: {
    status: string;
    assignment: string;
    archived: boolean;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const { t } = useLanguage();
  
  const hasActiveFilters = filters.status !== 'all' || 
                          filters.assignment !== 'all' || 
                          filters.archived;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          {t('categories.filters')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {t('categories.activeFilters')}: {Object.values(filters).filter(Boolean).length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              {t('common.clear')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryFilterCard;
