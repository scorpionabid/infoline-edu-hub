
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Clock, XCircle, FileEdit } from 'lucide-react';
import { format } from 'date-fns';
import { CategoryWithColumns } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryCardProps {
  category: CategoryWithColumns;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const { t } = useLanguage();
  
  const getStatusBadge = () => {
    if (!category.status) return null;
    
    const status = category.status;
    
    if (status === 'draft') {
      return (
        <Badge variant="outline" className="flex items-center">
          <FileEdit className="h-3 w-3 mr-1" />
          {t('draft')}
        </Badge>
      );
    }
    
    if (status === 'pending') {
      return (
        <Badge variant="secondary" className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {t('pending')}
        </Badge>
      );
    }
    
    if (status === 'approved') {
      return (
        <Badge variant="success" className="flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('approved')}
        </Badge>
      );
    }
    
    if (status === 'rejected') {
      return (
        <Badge variant="destructive" className="flex items-center">
          <XCircle className="h-3 w-3 mr-1" />
          {t('rejected')}
        </Badge>
      );
    }
    
    return null;
  };
  
  // Tamamlanma faizi
  const completionPercentage = category.completionPercentage || 0;
  
  // Son tarix
  const deadlineFormatted = category.deadline 
    ? format(new Date(category.deadline), 'dd.MM.yyyy')
    : null;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-5">
        <div className="flex justify-between">
          <CardTitle className="text-lg">{category.name}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {category.description || t('noCategoryDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('fields')}:</span>
            <span className="font-medium">{category.columns?.length || 0}</span>
          </div>
          
          {deadlineFormatted && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('deadline')}:</span>
              <span className="font-medium">{deadlineFormatted}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('completion')}:</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-3 flex justify-end">
        <Button onClick={onClick} className="w-full">
          {category.status === 'approved' ? t('viewForm') : t('fillForm')}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
};
