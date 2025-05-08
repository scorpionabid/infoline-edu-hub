
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category, DeadlineItem, FormItem } from '@/types/dashboard';
import { useLanguageSafe } from '@/context/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';

interface FormTabsProps {
  categories: Category[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
}

const FormTabs = ({ categories, upcoming, pendingForms }: FormTabsProps) => {
  const navigate = useNavigate();
  const { t } = useLanguageSafe();
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: az });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <>
      <TabsContent value="upcoming" className="space-y-4">
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t('noUpcomingDeadlines')}
              </p>
            </CardContent>
          </Card>
        ) : (
          upcoming.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.categoryName || item.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t('deadline')}: <span className="font-medium">{formatDate(item.dueDate)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('status')}: <span className="font-medium">{t(item.status)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/forms/${item.categoryId}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('view')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="pending" className="space-y-4">
        {pendingForms.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t('noPendingForms')}
              </p>
            </CardContent>
          </Card>
        ) : (
          pendingForms.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.categoryName || item.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      {t('submittedAt')}: {item.submittedAt ? formatDate(item.submittedAt) : t('notSubmittedYet')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('status')}: <span className="font-medium">{t(item.status)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/forms/${item.categoryId}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('view')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="categories" className="space-y-4">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {t('noCategories')}
              </p>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground mb-1">
                        {category.description}
                      </div>
                    )}
                    {category.deadline && (
                      <div className="text-sm flex items-center text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(category.deadline)}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/forms/${category.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('view')}
                  </Button>
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
