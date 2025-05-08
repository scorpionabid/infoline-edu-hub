
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/context/LanguageContext';
import { Plus, FileCheck, AlertTriangle, Clock, ArrowUpRight, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from 'date-fns';
import { DeadlineItem, FormItem, CategoryItem } from '@/types/dashboard';

export interface FormTabsProps {
  upcoming: DeadlineItem[];
  categories: CategoryItem[];
  pendingForms: FormItem[];
  navigateToDataEntry: () => void;
  handleFormClick: (id: string) => void;
}

export const FormTabs: React.FC<FormTabsProps> = ({
  upcoming,
  categories,
  pendingForms,
  navigateToDataEntry,
  handleFormClick
}) => {
  const { t } = useLanguage();
  const now = new Date();

  // Format the date in the distance format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, now, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge for deadline items
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            {t('upcoming')}
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t('overdue')}
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <FileCheck className="h-3 w-3 mr-1" />
            {t('completed')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('forms')}</CardTitle>
        <CardDescription>{t('formsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {t('upcoming')}
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center">
              <FileCheck className="h-4 w-4 mr-2" />
              {t('categories')}
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {t('pendingForms')}
              {pendingForms.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingForms.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noUpcomingDeadlines')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('formName')}</TableHead>
                    <TableHead>{t('dueDate')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('completionRate')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.category || item.categoryName}</TableCell>
                      <TableCell>{formatDate(item.dueDate)}</TableCell>
                      <TableCell>{getStatusBadge(item.status || 'upcoming')}</TableCell>
                      <TableCell>{item.completionRate}%</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFormClick(item.categoryId || '')}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          {t('continue')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="categories">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noCategories')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="border">
                    <CardHeader className="pb-1">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1 inline" />
                          {formatDate(category.deadline)}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleFormClick(category.id)}
                        >
                          {t('fillForm')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button onClick={navigateToDataEntry}>
                <Plus className="h-4 w-4 mr-2" />
                {t('newDataEntry')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pending">
            {pendingForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noPendingForms')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('formName')}</TableHead>
                    <TableHead>{t('submittedAt')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>{form.category || form.categoryName}</TableCell>
                      <TableCell>{formatDate(form.submittedAt || '')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Clock className="h-3 w-3 mr-1" />
                          {t('pending')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFormClick(form.categoryId || '')}
                        >
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          {t('viewDetails')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FormTabs;
