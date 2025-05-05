
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, ChevronRight, ClipboardList } from 'lucide-react';
import { CategoryWithColumns } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';

interface CategoryCardProps {
  category: CategoryWithColumns;
  onClick?: () => void;
  disabled?: boolean;
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'active':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'inactive':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusText = (status: string, t: (key: string) => string): string => {
  switch (status) {
    case 'active':
      return t('active');
    case 'draft':
      return t('draft');
    case 'inactive':
      return t('inactive');
    default:
      return status;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getCompletionVariant = (completion: number): string => {
  if (completion >= 75) return 'success';
  if (completion >= 50) return 'warning';
  return 'danger';
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, disabled = false }) => {
  const { t } = useLanguage();
  
  // Varsayılan olarak ya bir completionRate ya da 0 değeri kullan
  const completionRate = category.completionRate !== undefined ? category.completionRate : 0;
  
  return (
    <Card className={`overflow-hidden transition-all duration-200 ${disabled ? 'opacity-70' : 'hover:shadow-md cursor-pointer'}`} onClick={disabled ? undefined : onClick}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{category.name}</CardTitle>
          <Badge variant={getStatusVariant(category.status || 'active')}>
            {getStatusText(category.status || 'active', t)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {category.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4 mr-1" />
            <span>{category.columns?.length || 0} {t('columns')}</span>
          </div>
          
          {category.deadline && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{t('deadline')}: {format(new Date(category.deadline), 'dd.MM.yyyy')}</span>
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{t('completion')}</span>
              <span className={completionRate > 70 ? 'text-green-600' : completionRate > 30 ? 'text-amber-600' : 'text-red-600'}>
                {completionRate}%
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full justify-between" disabled={disabled}>
          {/* active və approved fərqli tipləri müqayisə etməməlidir */}
          {category.status === 'active' ? t('fillForm') : t('viewDetails')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
