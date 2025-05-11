
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { FormTabsProps, CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileClock, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FormTabs: React.FC<FormTabsProps> = ({ 
  categories, 
  upcoming, 
  pendingForms,
  navigateToDataEntry,
  handleFormClick
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleDataEntryClick = () => {
    if (navigateToDataEntry) {
      navigateToDataEntry();
    } else {
      navigate('/data-entry');
    }
  };
  
  const handleViewForm = (id: string) => {
    if (handleFormClick) {
      handleFormClick(id);
    } else {
      navigate(`/data-entry/${id}`);
    }
  };
  
  return (
    <>
      <TabsContent value="upcoming">
        <Card>
          <CardContent className="p-6">
            {upcoming && upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-start gap-3">
                      <FileClock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">{item.title || item.name}</h4>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.deadline}
                          {item.daysLeft !== undefined && (
                            <span className="ml-2 text-amber-600 font-medium">
                              {item.daysLeft} {t('daysLeft')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleViewForm(item.id)}>{t('openForm')}</Button>
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
          <CardContent className="p-6">
            {pendingForms && pendingForms.length > 0 ? (
              <div className="space-y-4">
                {pendingForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <h4 className="font-medium">{form.title || form.name}</h4>
                      <div className="text-sm text-muted-foreground">{form.categoryName || form.category}</div>
                      {form.dueDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {t('dueDate')}: {form.dueDate}
                        </div>
                      )}
                    </div>
                    <Button size="sm" onClick={() => handleViewForm(form.id)}>{t('continue')}</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noPendingForms')}</p>
                <Button className="mt-4" onClick={handleDataEntryClick}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t('newDataEntry')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="categories">
        <Card>
          <CardContent className="p-6">
            {categories && categories.length > 0 ? (
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{category.name}</h4>
                      <span className="text-sm">{category.completionRate}%</span>
                    </div>
                    <Progress value={category.completionRate} className="h-2" />
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
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
