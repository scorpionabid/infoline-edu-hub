
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'bg-green-500';
    case 'rejected': return 'bg-red-500';
    case 'pending': return 'bg-yellow-500';
    case 'draft': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};

interface FormTabsProps {
  recentForms: FormItem[];
  upcomingDeadlines: FormItem[];
}

export const FormTabs: React.FC<FormTabsProps> = ({ recentForms, upcomingDeadlines }) => {
  const { t } = useLanguage();

  const renderForm = (form: FormItem) => {
    return (
      <div key={form.id} className="flex items-center justify-between p-3 border-b last:border-0">
        <div className="space-y-1">
          <div className="flex items-center">
            <div className={cn("w-2 h-2 rounded-full mr-2", getStatusColor(form.status))} />
            <h4 className="font-medium">{form.title || form.name || form.categoryName}</h4>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {form.dueDate && (
              <div className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span>{t('dueDate')}: {form.dueDate}</span>
              </div>
            )}
            {form.createdAt && (
              <div className="flex items-center ml-2">
                <Clock className="h-3 w-3 mr-1" />
                <span>{t('created')}: {form.createdAt}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {form.completionRate !== undefined && (
            <div className="text-xs font-medium">
              {form.completionRate}%
            </div>
          )}
          <Badge variant="outline" className={cn(
            "text-xs",
            form.status === 'approved' && "bg-green-100 text-green-800 border-green-200",
            form.status === 'rejected' && "bg-red-100 text-red-800 border-red-200",
            form.status === 'pending' && "bg-yellow-100 text-yellow-800 border-yellow-200",
            form.status === 'draft' && "bg-gray-100 text-gray-800 border-gray-200",
          )}>
            {t(form.status.toLowerCase())}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{t('forms')}</CardTitle>
        <CardDescription>{t('formsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="recent" className="p-0">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="recent">{t('recentForms')}</TabsTrigger>
              <TabsTrigger value="upcoming">{t('upcomingDeadlines')}</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="recent" className="p-0 border-t">
            {recentForms && recentForms.length > 0 ? (
              recentForms.map(renderForm)
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p>{t('noRecentForms')}</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming" className="p-0 border-t">
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map(renderForm)
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p>{t('noUpcomingDeadlines')}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
