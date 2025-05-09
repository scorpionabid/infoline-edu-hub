
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { FormTabsProps, CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';
import { CalendarIcon, ClockIcon, FileTextIcon } from 'lucide-react';

const FormTabs: React.FC<FormTabsProps> = ({ 
  categories, 
  upcoming, 
  pendingForms,
  navigateToDataEntry,
  handleFormClick 
}) => {
  const { t } = useLanguage();
  
  return (
    <>
      <TabsContent value="upcoming" className="mt-0">
        <Card>
          <CardContent className="pt-6 px-6">
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noUpcomingDeadlines')}
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('daysLeft', { count: item.daysLeft })}
                        </p>
                      </div>
                    </div>
                    {handleFormClick && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFormClick(item.categoryId || item.id)}
                      >
                        {t('fillForm')}
                      </Button>
                    )}
                  </div>
                ))}
                {navigateToDataEntry && (
                  <div className="mt-4 text-right">
                    <Button variant="outline" onClick={navigateToDataEntry}>
                      {t('viewAllForms')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="pending" className="mt-0">
        <Card>
          <CardContent className="pt-6 px-6">
            {pendingForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noPendingForms')}
              </div>
            ) : (
              <div className="space-y-4">
                {pendingForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <ClockIcon className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{form.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {form.categoryName || t('pending')}
                        </p>
                      </div>
                    </div>
                    {handleFormClick && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFormClick(form.id)}
                      >
                        {t('viewForm')}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="categories" className="mt-0">
        <Card>
          <CardContent className="pt-6 px-6">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noCategories')}
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileTextIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-full max-w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${category.completionRate}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground">
                            {Math.round(category.completionRate)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {handleFormClick && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleFormClick(category.id)}
                      >
                        {t('viewCategory')}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default FormTabs;
