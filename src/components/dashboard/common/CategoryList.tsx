
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryStat } from '@/types/dashboard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { az, ru, enUS, tr } from 'date-fns/locale';

interface CategoryListProps {
  categories: CategoryStat[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const { t, currentLanguage } = useLanguage();
  
  const getLocale = () => {
    switch (currentLanguage) {
      case 'az':
        return az;
      case 'ru':
        return ru;
      case 'tr':
        return tr;
      default:
        return enUS;
    }
  };

  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('categories')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('noCategories')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('categories')}</CardTitle>
        <Button variant="outline" asChild size="sm">
          <Link to="/categories">{t('viewAll')}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="p-4 border rounded-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={category.status === 'active' ? "success" : 
                               category.status === 'draft' ? "secondary" : 
                               "destructive"}
                    >
                      {category.status}
                    </Badge>
                    {category.deadline && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {formatDistanceToNow(new Date(category.deadline), { 
                            addSuffix: true,
                            locale: getLocale()
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    {category.completionRate || 0}%
                  </div>
                  <div className="w-24 md:w-32">
                    <Progress value={category.completionRate || 0} className="h-2" />
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/categories/${category.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryList;
