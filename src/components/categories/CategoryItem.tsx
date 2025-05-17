
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/category';
import { Progress } from '@/components/ui/progress';

interface CategoryItemProps {
  category: Category;
  onCategorySelect?: (id: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onCategorySelect }) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'archived':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Calculate remaining days if deadline exists
  const calculateDaysLeft = () => {
    if (!category.deadline) return null;
    
    const deadlineDate = new Date(category.deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysLeft = calculateDaysLeft();
  const completionRate = category.completionRate || 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            )}
          </div>
          <Badge variant={getBadgeVariant(category.status || 'draft')}>
            {category.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Tamamlanan</span>
              <span className="text-sm font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          
          {category.deadline && (
            <div className="text-sm">
              <span className="font-medium">Son Tarix: </span>
              <span>{new Date(category.deadline).toLocaleDateString()}</span>
              {daysLeft !== null && (
                <Badge variant={daysLeft < 0 ? 'destructive' : daysLeft < 3 ? 'warning' : 'outline'} className="ml-2">
                  {daysLeft < 0 ? 'Gecikib' : `${daysLeft} gün qalıb`}
                </Badge>
              )}
            </div>
          )}
          
          {category.column_count !== undefined && (
            <div className="text-sm">
              <span className="font-medium">Sahələr: </span>
              <span>{category.column_count}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => onCategorySelect && onCategorySelect(category.id)}
        >
          Bax
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryItem;
