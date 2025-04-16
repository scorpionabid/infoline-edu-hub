
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CategoryStat } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface CategoriesListProps {
  categories: CategoryStat[];
  onViewCategory?: (categoryId: string) => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories, onViewCategory }) => {
  const { t } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categories')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {categories.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noCategories')}
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(category.status || 'active')}
                    >
                      {getStatusIcon(category.status || 'active')}
                      <span className="ml-1">{t(category.status || 'active')}</span>
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{t('completion')}</span>
                      <span>{category.completionPercentage || category.completionRate || 0}%</span>
                    </div>
                    <Progress value={category.completionPercentage || category.completionRate || 0} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('deadline')}: {category.deadline || '-'}</span>
                    <span>{t('columns')}: {category.columnCount || 0}</span>
                  </div>
                  
                  {onViewCategory && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewCategory(category.id)}
                      className="w-full"
                    >
                      {t('viewCategory')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CategoriesList;
