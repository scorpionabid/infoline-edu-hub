
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface FormTabsProps {
  upcomingForms: FormItem[];
  recentForms: FormItem[];
}

export const FormTabs: React.FC<FormTabsProps> = ({ upcomingForms, recentForms }) => {
  const { t } = useLanguage();

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t('approved')}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{t('pending')}</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{t('rejected')}</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t('draft')}</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{t('noStatus')}</Badge>;
    }
  };

  const renderFormList = (forms: FormItem[]) => {
    if (!forms || forms.length === 0) {
      return <p className="text-muted-foreground p-4 text-center">{t('noForms')}</p>;
    }

    return (
      <div className="space-y-3">
        {forms.map((form) => (
          <div key={form.id} className="flex p-3 border rounded-md justify-between items-center">
            <div>
              <h3 className="font-semibold mb-1">{form.title}</h3>
              <div className="flex text-sm text-muted-foreground space-x-3">
                {form.dueDate && (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{format(new Date(form.dueDate), 'dd.MM.yyyy')}</span>
                  </div>
                )}
                {form.createdAt && (
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{format(new Date(form.createdAt), 'dd.MM.yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
            {getStatusBadge(form.status)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="upcoming">{t('upcomingDeadlines')}</TabsTrigger>
        <TabsTrigger value="recent">{t('recentForms')}</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingDeadlines')}</CardTitle>
            <CardDescription>{t('formsWithDueDate')}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderFormList(upcomingForms)}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recent">
        <Card>
          <CardHeader>
            <CardTitle>{t('recentForms')}</CardTitle>
            <CardDescription>{t('recentlyUpdatedForms')}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderFormList(recentForms)}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default FormTabs;
