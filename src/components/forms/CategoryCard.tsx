
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryCardProps {
  category: Category;
  onStart: () => void;
  readOnly?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onStart,
  readOnly = false
}) => {
  const { t } = useLanguage();
  
  // Status badgesi üçün stil və mətnlər
  const getBadgeProps = (status: string) => {
    switch(status) {
      case 'approved':
        return { className: 'bg-green-500 hover:bg-green-600', label: t('approved') };
      case 'pending':
        return { className: 'bg-yellow-500 hover:bg-yellow-600', label: t('pending') };
      case 'rejected':
        return { className: 'bg-red-500 hover:bg-red-600', label: t('rejected') };
      case 'draft':
        return { className: 'bg-gray-500 hover:bg-gray-600', label: t('draft') };
      default:
        return { className: 'bg-blue-500 hover:bg-blue-600', label: t('active') };
    }
  };
  
  const badgeProps = getBadgeProps(category.status);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-2">{category.name}</CardTitle>
          <Badge className={badgeProps.className}>
            {badgeProps.label}
          </Badge>
        </div>
        {category.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{category.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {category.deadline && (
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <CalendarDays className="h-4 w-4 mr-1" />
            <span>{t('deadline')}: {new Date(category.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full flex justify-between items-center" 
          onClick={onStart}
          variant={readOnly ? "outline" : "default"}
          disabled={readOnly && category.status === 'approved'}
        >
          {readOnly ? t('view') : t('start')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
