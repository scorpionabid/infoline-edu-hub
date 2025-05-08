
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, CheckCircle, Clock, XCircle, Pencil, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category } from '@/types/column';
import { format, isAfter, parseISO } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  onUpdate?: () => void;
}

const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return 'Təyin edilməyib';
  
  try {
    if (typeof dateInput === 'string') {
      return new Date(dateInput).toLocaleDateString();
    } else {
      return dateInput.toLocaleDateString();
    }
  } catch (e) {
    return 'Keçərsiz tarix';
  }
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onUpdate }) => {
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
    const deadlineDate = typeof category.deadline === 'string' ? parseISO(category.deadline) : category.deadline;
    return isAfter(new Date(), deadlineDate);
  };

  const status = getStatusDetails();

  const handleViewClick = () => {
    navigate(`/data-entry/${category.id}`);
  };

  const handleEditClick = () => {
    navigate(`/categories/${category.id}/edit`);
  };

  // Format date
  const deadline = formatDate(category.deadline);

  // Default completionRate
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
              {t('deadline')}: {deadline}
              {isPastDeadline() && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {t('overdue')}
                </Badge>
              )}
            </span>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('completion')}</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewClick}
          >
            {t('view')}
          </Button>
          {canApproveData && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEditClick}
            >
              {t('edit')}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
