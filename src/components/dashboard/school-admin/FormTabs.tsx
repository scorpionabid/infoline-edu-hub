
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';
import { Calendar, ClipboardCheck, Clock, PlusCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({ categories, upcoming, pendingForms, navigateToDataEntry, handleFormClick }) => {
  const { t } = useLanguage();
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString || 'N/A';
    }
  };
  
  return (
    <>
      <TabsContent value="upcoming" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingDeadlines')}</CardTitle>
            <CardDescription>{t('upcomingDeadlinesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>{t('noUpcomingDeadlines')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between space-x-4 border-b pb-4 last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center 
                        ${item.status === 'upcoming' ? 'bg-orange-100 text-orange-600' : 
                          item.status === 'overdue' ? 'bg-red-100 text-red-600' : 
                          'bg-gray-100 text-gray-600'}`}>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.categoryName}</h4>
                        <div className="text-xs text-muted-foreground">{formatDate(item.dueDate)}</div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 items-end">
                      <div className="text-sm font-medium">{`${item.completionRate}%`}</div>
                      <Progress value={item.completionRate} className="h-2 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {navigateToDataEntry && (
            <CardFooter>
              <Button onClick={navigateToDataEntry} className="ml-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('newDataEntry')}
              </Button>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
      
      <TabsContent value="pending" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>{t('pendingForms')}</CardTitle>
            <CardDescription>{t('pendingFormsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardCheck className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>{t('noPendingForms')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingForms.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between space-x-4 border-b pb-4 last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => handleFormClick && handleFormClick(item.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-amber-100 text-amber-600 w-8 h-8 flex items-center justify-center">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.categoryName}</h4>
                        {item.submittedAt && (
                          <div className="text-xs text-muted-foreground">
                            {`${t('submitted')}: ${formatDate(item.submittedAt)}`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm rounded-full px-2 py-1 
                        ${item.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                          item.status === 'approved' ? 'bg-green-100 text-green-600' : 
                          item.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                          'bg-gray-100 text-gray-600'}`}>
                        {item.status === 'pending' ? t('pending') : 
                         item.status === 'approved' ? t('approved') : 
                         item.status === 'rejected' ? t('rejected') : 
                         item.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {navigateToDataEntry && (
            <CardFooter>
              <Button onClick={navigateToDataEntry} className="ml-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('newDataEntry')}
              </Button>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
      
      <TabsContent value="categories" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>{t('allCategories')}</CardTitle>
            <CardDescription>{t('allCategoriesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardCheck className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>{t('noCategories')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between space-x-4 border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-blue-100 text-blue-600 w-8 h-8 flex items-center justify-center">
                        <ClipboardCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        {item.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 items-end">
                      <div className="text-sm font-medium">{`${item.completionRate}%`}</div>
                      <Progress value={item.completionRate} className="h-2 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {navigateToDataEntry && (
            <CardFooter>
              <Button onClick={navigateToDataEntry} className="ml-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('newDataEntry')}
              </Button>
            </CardFooter>
          )}
        </Card>
      </TabsContent>
    </>
  );
};

export default FormTabs;
