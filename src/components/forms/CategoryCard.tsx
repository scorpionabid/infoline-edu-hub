
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { Category } from '@/types/category';
import { Progress } from '@/components/ui/progress';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // STATUS: aktive, inactive, approved
  const getStatusBadge = () => {
    if (category.status === 'active') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          {t('active')}
        </Badge>
      );
    } else if (category.status === 'approved') {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          {t('approved')}
        </Badge>
      );
    } else if (category.status === 'draft') {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          {t('draft')}
        </Badge>
      );
    } else if (category.status === 'archived') {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          {t('archived')}
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          {t('inactive')}
        </Badge>
      );
    }
  };

  const hasDeadline = category.deadline && new Date(category.deadline) > new Date();
  const timeRemaining = hasDeadline
    ? formatDistanceToNow(new Date(category.deadline!))
    : null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-primary/5 p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg line-clamp-2">{category.name}</h3>
            {getStatusBadge()}
          </div>
          
          {category.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {category.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-3 text-sm">
            {hasDeadline && (
              <div className="flex items-center text-muted-foreground">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>{t('timeRemaining')}: {timeRemaining}</span>
              </div>
            )}
            
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{t('fields')}: {category.column_count || 0}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {category.completionRate !== undefined ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{t('completion')}</span>
                <span className="text-sm font-medium">{category.completionRate}%</span>
              </div>
              <Progress 
                value={category.completionRate} 
                className={`h-2 ${category.completionRate >= 80 ? 'bg-green-100' : category.completionRate >= 40 ? 'bg-yellow-100' : 'bg-red-100'}`} 
              />
            </>
          ) : (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{t('noDataAvailable')}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button 
          onClick={() => navigate(`/forms/${category.id}`)}
          size="sm"
          variant={category.status === 'active' || category.status === 'approved' ? "default" : "outline"}
        >
          {category.status === 'active' || category.status === 'approved' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('fillForm')}
            </>
          ) : (
            t('viewDetails')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
