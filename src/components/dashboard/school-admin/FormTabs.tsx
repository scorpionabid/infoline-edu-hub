
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormItem } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';

export interface FormTabsProps {
  upcomingForms: FormItem[];
  recentForms: FormItem[];
}

export const FormTabs: React.FC<FormTabsProps> = ({ upcomingForms = [], recentForms = [] }) => {
  const { t } = useLanguage();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Təyin edilməyib';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (error) {
      return 'Yanlış tarix';
    }
  };
  
  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="upcoming">
          {t('upcomingDeadlines')}
        </TabsTrigger>
        <TabsTrigger value="recent">
          {t('recentForms')}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming">
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingDeadlines')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingForms.length > 0 ? (
              upcomingForms.map((form) => (
                <div key={form.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{form.title}</h4>
                      <p className="text-sm text-muted-foreground">{form.categoryId}</p>
                    </div>
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      <span>{formatDate(form.dueDate)}</span>
                    </div>
                  </div>
                  {form.progress !== undefined && (
                    <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${form.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-muted-foreground">{t('noUpcomingDeadlines')}</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="recent">
        <Card>
          <CardHeader>
            <CardTitle>{t('recentForms')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentForms.length > 0 ? (
              recentForms.map((form) => (
                <div key={form.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{form.title}</h4>
                      <p className="text-sm text-muted-foreground">{form.categoryId}</p>
                    </div>
                    <div className="flex items-center text-sm">
                      <ClockIcon className="mr-1 h-4 w-4" />
                      <span>{formatDate(form.updatedAt || form.createdAt)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className={`px-2 py-0.5 rounded-full ${
                      form.status === 'approved' ? 'bg-green-100 text-green-800' :
                      form.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {form.status === 'approved' ? t('approved') :
                       form.status === 'rejected' ? t('rejected') :
                       t('pending')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-muted-foreground">{t('noRecentForms')}</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
