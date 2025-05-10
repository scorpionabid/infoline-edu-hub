
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CategoryItem } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';

interface CategoryProgressListProps {
  categories: CategoryItem[];
}

const getCategoryStatusVariant = (status?: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    case 'pending':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'approved':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const CategoryProgressList: React.FC<CategoryProgressListProps> = ({ categories }) => {
  const sortedCategories = [...categories].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <div className="space-y-4">
      {sortedCategories.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          Kateqoriya məlumatları yoxdur
        </div>
      ) : (
        sortedCategories.slice(0, 5).map((category) => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium truncate" title={category.name}>
                  {category.name}
                </span>
                {category.status && (
                  <Badge variant="outline" className={`ml-2 ${getCategoryStatusVariant(category.status)}`}>
                    {category.status}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{category.completionRate}%</span>
            </div>
            <Progress value={category.completionRate} className="h-1" />
          </div>
        ))
      )}
    </div>
  );
};

export default CategoryProgressList;
