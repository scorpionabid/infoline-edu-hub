
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryStat } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

interface CategoryListProps {
  categories: CategoryStat[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('categories')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('noCategories')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categories')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => {
            const completionRate = category.completionRate ?? category.completion?.percentage ?? 0;
            
            return (
              <div key={category.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 mb-3 sm:mb-0 flex-1">
                  <h4 className="font-medium">{category.name}</h4>
                  <div className="flex-1">
                    <Progress value={completionRate} className="h-2" />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        {completionRate}% {t('completed')}
                      </span>
                      {category.deadline && (
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(category.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {category.columnCount || 0} {t('columns')}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={
                        category.status === 'active' 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                      }
                    >
                      {category.status}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/categories/${category.id}`)}
                  className="sm:ml-4"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('viewDetails')}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryList;
