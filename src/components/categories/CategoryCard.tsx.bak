
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import { CalendarIcon, PenIcon, Trash2Icon, EyeIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => void;
  onView?: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  onView
}) => {
  const { t } = useLanguage();
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'inactive':
        return 'outline';
      case 'archived':
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  const formatDeadline = (deadline: string | Date | undefined | null) => {
    if (!deadline) return t('noDeadline');
    
    try {
      const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
      return format(date, 'PPP');
    } catch (error) {
      return t('invalidDate');
    }
  };
  
  // Safe access to completionRate with default value
  const completionRate = category.completionRate !== undefined ? category.completionRate : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="truncate">{category.name}</CardTitle>
          <Badge variant={getBadgeVariant(category.status)}>
            {t(category.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {category.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {category.description}
          </p>
        )}
        
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-4">
          <CalendarIcon className="h-3 w-3" />
          <span>{t('deadline')}: {formatDeadline(category.deadline)}</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{t('completion')}</span>
            <span>{completionRate}%</span>
          </div>
          <Progress value={completionRate} />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView && onView(category.id)}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            {t('view')}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit && onEdit(category)}
            >
              <PenIcon className="h-4 w-4" />
              <span className="sr-only">{t('edit')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete && onDelete(category.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2Icon className="h-4 w-4" />
              <span className="sr-only">{t('delete')}</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
