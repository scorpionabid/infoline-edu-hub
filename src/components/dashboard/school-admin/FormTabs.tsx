
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryItem, DeadlineItem, FormItem, FormTabsProps } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

const FormTabs: React.FC<FormTabsProps> = ({
  categories,
  upcoming,
  pendingForms,
  navigateToDataEntry,
  handleFormClick
}) => {
  const { t } = useLanguage();

  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
        <TabsTrigger value="upcoming">{t('upcomingDeadlines')}</TabsTrigger>
        <TabsTrigger value="pending">{t('pendingForms')}</TabsTrigger>
      </TabsList>

      <TabsContent value="categories">
        <Card>
          <CardHeader>
            <CardTitle>{t('categories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{category.name}</h3>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {category.columnCount || 0} {t('fields')}
                    </div>
                    <Button 
                      className="mt-2 w-full" 
                      size="sm"
                      onClick={() => navigateToDataEntry && navigateToDataEntry()}
                    >
                      {t('enterData')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="upcoming">
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingDeadlines')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcoming.map((deadline) => (
                <Card key={deadline.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{deadline.title || deadline.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(deadline.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">
                        {deadline.daysLeft} {t('daysLeft')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>{t('pendingForms')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingForms.map((form) => (
                <Card key={form.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{form.name || (form.category && form.category.name) || ""}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('status')}: {form.status}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleFormClick && handleFormClick(form.id)}
                      >
                        {t('view')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default FormTabs;
