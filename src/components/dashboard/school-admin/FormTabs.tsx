
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';

interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
}

const FormTabs: React.FC<FormTabsProps> = ({ categories, upcoming, pendingForms }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleItemClick = (id: string) => {
    navigate(`/data-entry/${id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">{t('completed')}</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">{t('pending')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">{t('rejected')}</Badge>;
      case 'not-started':
        return <Badge variant="outline">{t('notStarted')}</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500">{t('inProgress')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDaysRemainingText = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return <span className="text-red-500">{t('overdue')}</span>;
    }
    if (daysRemaining === 0) {
      return <span className="text-amber-500">{t('dueToday')}</span>;
    }
    if (daysRemaining <= 7) {
      return <span className="text-amber-500">{t('daysRemaining', { count: daysRemaining })}</span>;
    }
    return <span>{t('daysRemaining', { count: daysRemaining })}</span>;
  };

  return (
    <>
      <TabsContent value="upcoming">
        <div className="grid gap-4">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">{t('noUpcomingDeadlines')}</p>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleItemClick(item.id)}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-lg">{item.title || item.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.category || item.categoryName}
                      </p>
                    </div>
                    <div>{getStatusBadge(item.status)}</div>
                  </div>
                  
                  <div className="flex items-center mt-4 text-sm">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="mr-4">
                      {item.deadline ? format(new Date(item.deadline), 'dd.MM.yyyy') : (item.dueDate ? format(new Date(item.dueDate), 'dd.MM.yyyy') : '-')}
                    </span>
                    <ClockIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{getDaysRemainingText(item.daysRemaining)}</span>
                  </div>
                  
                  {(item.progress !== undefined || item.completionRate !== undefined) && (
                    <div className="mt-3 w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${item.progress || item.completionRate || 0}%` }}
                      ></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="pending">
        <div className="grid gap-4">
          {pendingForms.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">{t('noPendingForms')}</p>
              </CardContent>
            </Card>
          ) : (
            pendingForms.map((form) => (
              <Card key={form.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleItemClick(form.id)}>
                <CardContent className="p-5">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold">{form.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {form.category || form.categoryId}
                      </p>
                    </div>
                    <div>{getStatusBadge(form.status)}</div>
                  </div>
                  
                  <div className="flex items-center mt-3 text-sm">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {form.updatedAt ? format(new Date(form.updatedAt), 'dd.MM.yyyy') : 
                       (form.date ? format(new Date(form.date), 'dd.MM.yyyy') : '-')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="categories">
        <div className="grid gap-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">{t('noCategories')}</p>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleItemClick(category.id)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <div>
                      {category.completionRate === 100 ? (
                        <CheckCircle2 className="text-green-500 h-5 w-5" />
                      ) : category.status === 'pending' ? (
                        <AlertCircle className="text-amber-500 h-5 w-5" />
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description || t('categoryDescription')}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span>{t('completionRate')}</span>
                    <span className="font-medium">{category.completionRate}%</span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        category.completionRate === 100
                          ? 'bg-green-500'
                          : category.completionRate > 0
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                      style={{ width: `${category.completionRate}%` }}
                    ></div>
                  </div>
                  
                  {category.deadline && (
                    <div className="flex items-center mt-3 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>{format(new Date(category.deadline), 'dd.MM.yyyy')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </>
  );
};

export default FormTabs;
