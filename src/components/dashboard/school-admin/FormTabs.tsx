
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertCircle, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';
import { formatDate } from '@/utils/formatters';

interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
}

const FormTabs: React.FC<FormTabsProps> = ({
  categories,
  upcoming,
  pendingForms
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleNavigateToForm = (categoryId: string) => {
    navigate(`/data-entry/${categoryId}`);
  };

  return (
    <>
      <TabsContent value="upcoming">
        <div className="grid grid-cols-1 gap-4">
          {upcoming.length > 0 ? (
            upcoming.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex justify-between">
                    <div>{item.title || item.categoryName}</div>
                    {getDaysRemainingBadge(item.daysRemaining || 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>{t('deadline')}: {formatDate(item.deadline)}</div>
                    <div>{t('categoryId')}: {item.categoryId || item.id}</div>
                  </div>
                  <Progress
                    value={item.completionRate || 0}
                    className="h-2"
                  />
                  <div className="flex justify-end">
                    <div className="text-xs text-muted-foreground">
                      {Math.round(item.completionRate || 0)}% {t('completed')}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end">
                  <Button 
                    onClick={() => handleNavigateToForm(item.categoryId || item.id)}
                  >
                    {t('goToForm')}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <div className="flex justify-center mb-4">
                  <Check className="h-12 w-12" />
                </div>
                <p>{t('noUpcomingDeadlines')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>{t('pendingForms')}</CardTitle>
            <CardDescription>{t('pendingFormsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('formTitle')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingForms.length > 0 ? (
                  pendingForms.map(form => (
                    <TableRow key={form.id}>
                      <TableCell>{form.title || form.name || form.categoryName}</TableCell>
                      <TableCell>{form.category || form.categoryName}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusClass(form.status)}
                        >
                          {t(form.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigateToForm(form.categoryId || form.id)}
                        >
                          {t('continue')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Check className="h-8 w-8 mb-2" />
                        <p>{t('noFormsWaiting')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map(category => (
                <Card key={category.id}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Progress
                      value={category.progress || category.completionPercentage || 0}
                      className="h-2 my-2"
                    />
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {Math.round(category.progress || category.completionPercentage || 0)}% {t('completed')}
                      </span>
                      {(category.dueDate || category.deadline) && (
                        <span className="text-muted-foreground">
                          {t('due')}: {formatDate(category.dueDate || category.deadline)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleNavigateToForm(category.id)}
                    >
                      {t('open')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {categories.length === 0 && (
                <div className="col-span-2 text-center p-12 text-muted-foreground">
                  <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                  <p>{t('noCategoriesFound')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

// Statuslara görə stil sinifləri
const getStatusClass = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    default:
      return '';
  }
};

// Qalan günlərə görə nişan
const getDaysRemainingBadge = (daysRemaining: number) => {
  if (daysRemaining < 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        {Math.abs(daysRemaining)} {Math.abs(daysRemaining) === 1 ? 'gün' : 'gün'} gecikir
      </Badge>
    );
  } else if (daysRemaining <= 3) {
    return (
      <Badge variant="warning" className="bg-amber-500 text-white flex items-center gap-1">
        <Clock className="h-4 w-4" />
        {daysRemaining} {daysRemaining === 1 ? 'gün' : 'gün'} qalır
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        {daysRemaining} {daysRemaining === 1 ? 'gün' : 'gün'} qalır
      </Badge>
    );
  }
};

export default FormTabs;
