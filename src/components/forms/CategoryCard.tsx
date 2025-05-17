
import React from 'react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Category, CategoryStatus } from '@/types/category';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface CategoryCardProps {
  category: Category;
  onSubmit?: (id: string) => void;
  onView?: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSubmit, onView }) => {
  const { t } = useLanguage();
  const { canApproveData } = usePermissions();

  const getStatusColor = (status: CategoryStatus) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'draft': return 'bg-amber-500';
      case 'archived': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusVariant = (status: CategoryStatus) => {
    switch(status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'draft': return 'warning';
      case 'archived': return 'destructive';
      default: return 'default';
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return t('noDeadline');
    try {
      return format(new Date(date), 'PPP');
    } catch (e) {
      return t('invalidDate');
    }
  };

  const hasDeadlinePassed = () => {
    if (!category.deadline) return false;
    return new Date(category.deadline) < new Date();
  };

  const completionRate = category.completionRate || 0;
  const isDeadlineNear = category.deadline && new Date(category.deadline).getTime() - new Date().getTime() < 86400000 * 3; // 3 days
  const acceptsData = category.status !== 'archived' && category.status !== 'inactive';
  
  const isApproved = category.status === 'approved';

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${getStatusColor(category.status)}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{category.name}</CardTitle>
            <CardDescription className="line-clamp-2">{category.description}</CardDescription>
          </div>
          <Badge variant={getStatusVariant(category.status as CategoryStatus)}>
            {t(category.status)}
          </Badge>
        </div>
      </CardHeader>

      <div className="px-6 py-2 space-y-4">
        {category.deadline && (
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('deadline')}: {formatDate(category.deadline)}
              {hasDeadlinePassed() && (
                <Badge variant="destructive" className="ml-2">{t('expired')}</Badge>
              )}
              {!hasDeadlinePassed() && isDeadlineNear && (
                <Badge variant="warning" className="ml-2">{t('deadlineSoon')}</Badge>
              )}
            </span>
          </div>
        )}
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t('completion')}</span>
            </div>
            <span>{completionRate}%</span>
          </div>
          <Progress value={completionRate} />
        </div>
      </div>

      <CardFooter className="flex justify-between pt-2">
        {acceptsData && (
          <Button 
            variant="default" 
            onClick={() => onSubmit && onSubmit(category.id)}
            className="flex-1 mr-2"
          >
            {isApproved ? t('viewData') : t('enterData')}
          </Button>
        )}
        
        <Button 
          variant="outline"
          onClick={() => onView && onView(category.id)}
          className={acceptsData ? "flex-1" : "flex-grow"}
        >
          {t('details')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
