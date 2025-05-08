
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { formatDistance } from 'date-fns';
import { CalendarIcon, CheckCircle2Icon, ClockIcon } from 'lucide-react';
import { CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';
import { Progress } from '@/components/ui/progress';

interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  onFormClick?: (formId: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({
  categories,
  upcoming,
  pendingForms,
  onFormClick
}) => {
  const { t } = useLanguage();
  
  const formatDeadline = (date?: string) => {
    if (!date) return t('noDeadline');
    try {
      return formatDistance(new Date(date), new Date(), { addSuffix: true });
    } catch (e) {
      return date;
    }
  };

  return (
    <>
      <TabsContent value="upcoming" className="space-y-4">
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2Icon className="w-12 h-12 text-primary mx-auto mb-2" />
              <p>{t('noUpcomingDeadlines')}</p>
            </CardContent>
          </Card>
        ) : (
          upcoming.map((deadline) => (
            <Card key={deadline.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                 onClick={() => onFormClick?.(deadline.categoryId)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{deadline.title || deadline.categoryName}</h3>
                  <Badge variant={deadline.daysRemaining < 2 ? "destructive" : "outline"}>
                    {deadline.daysRemaining} {t('daysLeft')}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {formatDeadline(deadline.deadline)}
                </div>
                <Progress value={deadline.completionRate} className="h-2" />
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span>{t('completion')}</span>
                  <span>{Math.round(deadline.completionRate)}%</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="pending" className="space-y-4">
        {pendingForms.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2Icon className="w-12 h-12 text-primary mx-auto mb-2" />
              <p>{t('noPendingForms')}</p>
            </CardContent>
          </Card>
        ) : (
          pendingForms.map((form) => (
            <Card key={form.id} className="cursor-pointer hover:shadow-md transition-shadow"
                 onClick={() => onFormClick?.(form.categoryId)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{form.title || form.category || form.categoryName}</h3>
                  <Badge variant={form.status === 'pending' ? "outline" : 
                                 form.status === 'rejected' ? "destructive" : "secondary"}>
                    {t(form.status)}
                  </Badge>
                </div>
                {form.deadline && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ClockIcon className="mr-1 h-4 w-4" />
                    {formatDeadline(form.deadline)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="categories" className="space-y-4">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p>{t('noCategories')}</p>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow"
                 onClick={() => onFormClick?.(category.id)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <Badge variant="outline">{t(category.status)}</Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  {category.dueDate && (
                    <>
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      {formatDeadline(category.dueDate)}
                    </>
                  )}
                </div>
                <Progress value={category.progress} className="h-2" />
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span>{t('completion')}</span>
                  <span>{Math.round(category.progress)}%</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </>
  );
};

export default FormTabs;
