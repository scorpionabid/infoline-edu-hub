
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeadlineItem, FormItem, CategoryItem } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
}

const FormTabs: React.FC<FormTabsProps> = ({ categories, upcoming, pendingForms }) => {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      console.error("Date format error:", error, dateString);
      return "Invalid date";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDeadlineStatus = (dueDate: string) => {
    try {
      const due = new Date(dueDate);
      const isOverdue = isAfter(new Date(), due);
      return isOverdue ? 'overdue' : 'upcoming';
    } catch (error) {
      console.error("Date comparison error:", error);
      return 'upcoming';
    }
  };

  return (
    <>
      <TabsContent value="upcoming">
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingDeadlines')}</CardTitle>
            <CardDescription>{t('upcomingDeadlinesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming && upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map(item => (
                  <div key={item.id} className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.categoryName}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.dueDate)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === 'upcoming' && <Clock className="h-3 w-3 mr-1" />}
                        {item.status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {item.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {t(item.status)}
                      </Badge>
                      <div className="text-sm font-medium">
                        {item.completionRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noUpcomingDeadlines')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>{t('pendingForms')}</CardTitle>
            <CardDescription>{t('pendingFormsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingForms && pendingForms.length > 0 ? (
              <div className="space-y-4">
                {pendingForms.map(form => (
                  <div key={form.id} className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{form.categoryName}</h3>
                      {form.submittedAt && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {t('submittedOn')} {formatDate(form.submittedAt)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {form.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {form.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {form.status === 'rejected' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {t(form.status)}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {}}
                      >
                        {t('viewDetails')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noPendingForms')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories">
        <Card>
          <CardHeader>
            <CardTitle>{t('allCategories')}</CardTitle>
            <CardDescription>{t('allCategoriesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {categories && categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                      {category.deadline && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {t('deadline')}: {formatDate(category.deadline)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {category.deadline && (
                        <Badge className={getStatusColor(getDeadlineStatus(category.deadline))}>
                          {getDeadlineStatus(category.deadline) === 'upcoming' ? 
                            t('upcoming') : t('overdue')}
                        </Badge>
                      )}
                      <div className="text-sm font-medium">
                        {category.completionRate}%
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {}}
                      >
                        {t('fillData')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noCategories')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default FormTabs;
