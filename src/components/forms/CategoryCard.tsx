
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, CheckCircle, Clock, XCircle, Pencil, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category } from '@/types/category';
import { format, isAfter, parseISO } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { canApproveData } = usePermissions();

  const getStatusDetails = () => {
    if (category.status === 'active') {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-4 w-4" />,
        label: t('active')
      };
    }
    
    if (category.status === 'approved') {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-4 w-4" />,
        label: t('approved')
      };
    }
    
    if (category.status === 'draft') {
      return {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <Pencil className="h-4 w-4" />,
        label: t('draft')
      };
    }
    
    if (category.status === 'inactive' || category.status === 'archived') {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="h-4 w-4" />,
        label: t(category.status)
      };
    }

    return {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <FileText className="h-4 w-4" />,
      label: category.status
    };
  };

  const isPastDeadline = () => {
    if (!category.deadline) return false;
    const deadlineDate = parseISO(category.deadline);
    return isAfter(new Date(), deadlineDate);
  };

  const status = getStatusDetails();

  const handleViewClick = () => {
    navigate(`/data-entry/${category.id}`);
  };

  const handleEditClick = () => {
    navigate(`/categories/${category.id}/edit`);
  };

  // Default completionRate əlavə edək
  const completionRate = category.completionRate || 0;

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      isPastDeadline() && category.deadline && 'border-red-300'
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <CardDescription className="line-clamp-2">{category.description}</CardDescription>
          </div>
          <Badge variant="outline" className={cn("flex gap-1 items-center whitespace-nowrap", status.color)}>
            {status.icon}
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {category.deadline && (
          <div className="flex items-center text-sm mb-3 text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>
              {t('deadline')}: {format(parseISO(category.deadline), 'PPP')}
              {isPastDeadline() && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {t('overdue')}
                </Badge>
              )}
            </span>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {t('completion')}: <span className="font-medium">{completionRate}%</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {t('columns')}: <span className="font-medium">{category.column_count || 0}</span>
            </div>
          </div>
          <Progress value={completionRate} className="h-2" 
            indicatorClassName={cn(
              completionRate < 30 ? 'bg-red-500' : 
              completionRate < 70 ? 'bg-amber-500' : 
              'bg-green-500'
            )} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={handleViewClick}>
            {category.status === 'active' || category.status === 'approved'
              ? canApproveData 
                ? <Clock className="mr-2 h-4 w-4" />
                : <FileText className="mr-2 h-4 w-4" />
              : <Pencil className="mr-2 h-4 w-4" />
            }
            {category.status === 'active' || category.status === 'approved'
              ? canApproveData 
                ? t('review')
                : t('viewData')
              : t('fillData')
            }
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
