
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarIcon } from 'lucide-react';
import { FormItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface PendingFormsListProps {
  forms: FormItem[];
  isLoading?: boolean;
  onFormClick?: (formId: string) => void;
}

const PendingFormsList: React.FC<PendingFormsListProps> = ({
  forms,
  isLoading = false,
  onFormClick
}) => {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{t('pending')}</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{t('draft')}</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t('completed')}</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{t('overdue')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingForms')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-9 w-[100px]" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pendingForms')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {forms.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {t('noPendingForms')}
          </div>
        ) : (
          forms.map((form) => (
            <div key={form.id} className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="font-medium">{form.title || form.name}</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  {form.category?.name || form.categoryName}
                  {form.deadline || form.dueDate ? (
                    <>
                      <span className="mx-1">•</span>
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDate(form.deadline || form.dueDate)}
                    </>
                  ) : null}
                  <span className="mx-1">•</span>
                  {getStatusBadge(form.status)}
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onFormClick && onFormClick(form.id)}
              >
                {t('view')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PendingFormsList;
