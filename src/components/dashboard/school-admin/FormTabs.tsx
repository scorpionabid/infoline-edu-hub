
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { FormItem } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface FormTabsProps {
  recentForms: FormItem[];
  upcomingDeadlines: FormItem[];
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'rejected':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case 'overdue':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

export const FormTabs: React.FC<FormTabsProps> = ({ recentForms = [], upcomingDeadlines = [] }) => {
  const { t } = useLanguage();
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return formatDistanceToNow(date, { addSuffix: true, locale: az });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <Tabs defaultValue="recent" className="w-full">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('forms')}</CardTitle>
            <TabsList>
              <TabsTrigger value="recent">{t('recent')}</TabsTrigger>
              <TabsTrigger value="deadlines">{t('deadlines')}</TabsTrigger>
            </TabsList>
          </div>
          <CardDescription>{t('manageYourForms')}</CardDescription>
        </CardHeader>
        <CardContent>
          <TabsContent value="recent" className="mt-0">
            {recentForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noRecentForms')}
              </div>
            ) : (
              <div className="space-y-2">
                {recentForms.map((form) => (
                  <div 
                    key={form.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        {getStatusIcon(form.status)}
                        <span className="ml-2 font-medium truncate">{form.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{form.categoryName}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(form.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusClass(form.status)}>{t(form.status.toLowerCase())}</Badge>
                      <Button variant="ghost" size="sm">{t('view')}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="deadlines" className="mt-0">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noUpcomingDeadlines')}
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map((form) => (
                  <div 
                    key={form.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="font-medium truncate">{form.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{form.categoryName}</p>
                      <span className="text-xs text-muted-foreground">
                        {t('dueOn')}: {formatDate(form.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">{t('fillForm')}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
};
