
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, PenSquare, FileCheck, AlertCircle } from 'lucide-react';
import { FormItem, DeadlineItem } from '@/types/dashboard';
import { formatDate } from '@/utils/formatters';

interface FormTabsProps {
  pendingForms: FormItem[];
  upcomingDeadlines: DeadlineItem[];
  onFormClick: (formId: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({ pendingForms, upcomingDeadlines, onFormClick }) => {
  const { t } = useLanguageSafe();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" /> {t('pending')}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <FileCheck className="mr-1 h-3 w-3" /> {t('approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> {t('rejected')}
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <PenSquare className="mr-1 h-3 w-3" /> {t('draft')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
  return (
    <Tabs defaultValue="pending">
      <TabsList className="mb-4">
        <TabsTrigger value="pending">
          {t('pendingDrafts')}
          {pendingForms.length > 0 && (
            <Badge variant="secondary" className="ml-2">{pendingForms.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="upcoming">
          {t('upcomingDeadlines')}
          {upcomingDeadlines.length > 0 && (
            <Badge variant="secondary" className="ml-2">{upcomingDeadlines.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="pending" className="space-y-4">
        {pendingForms.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {t('noPendingForms')}
          </div>
        ) : (
          pendingForms.map((form) => (
            <div key={form.id} className="flex flex-col p-4 border rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{form.category}</h3>
                  <p className="text-sm text-muted-foreground">{t('lastUpdated')}: {form.lastUpdate}</p>
                </div>
                {getStatusBadge(form.status)}
              </div>
              <div className="text-sm">
                <Button 
                  variant="link" 
                  className="px-0 h-auto font-normal text-primary" 
                  onClick={() => onFormClick(form.id)}
                >
                  {t('continue')}
                </Button>
              </div>
            </div>
          ))
        )}
      </TabsContent>
      
      <TabsContent value="upcoming" className="space-y-4">
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {t('noUpcomingDeadlines')}
          </div>
        ) : (
          upcomingDeadlines.map((deadline) => (
            <div key={deadline.id} className="flex flex-col p-4 border rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{deadline.categoryName}</h3>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <CalendarDays className="mr-1 h-4 w-4" /> 
                    {deadline.deadline}
                  </div>
                </div>
                <Badge 
                  variant={deadline.daysLeft <= 3 ? "destructive" : "outline"}
                  className={deadline.daysLeft <= 3 ? "" : "bg-orange-50 text-orange-700 border-orange-200"}
                >
                  {deadline.daysLeft === 0 
                    ? t('dueToday') 
                    : deadline.daysLeft < 0 
                      ? t('overdue') 
                      : t('daysRemaining', { count: deadline.daysLeft })}
                </Badge>
              </div>
              <div className="text-sm flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t('completion')}: {Math.round(deadline.completionRate || 0)}%
                </span>
                <Button 
                  variant="link" 
                  className="px-0 h-auto font-normal text-primary" 
                  onClick={() => onFormClick(deadline.id)}
                >
                  {(deadline.completionRate || 0) < 100 ? t('complete') : t('view')}
                </Button>
              </div>
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};

export default FormTabs;
