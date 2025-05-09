import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, FilePlus, Calendar, PlusCircle } from 'lucide-react';
import { CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormTabsProps {
  upcoming: DeadlineItem[];
  categories: CategoryItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({
  upcoming,
  categories,
  pendingForms,
  navigateToDataEntry,
  handleFormClick
}) => {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{t('approved')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{t('rejected')}</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{t('pending')}</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{t('draft')}</Badge>;
      default:
        if (status === 'upcoming') {
          return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{t('upcoming')}</Badge>;
        }
        return <Badge>{status}</Badge>;
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
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('form')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('deadline')}</TableHead>
                    <TableHead>{t('progress')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.length > 0 ? (
                    upcoming.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleFormClick?.(item.id)}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.categoryName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(item.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={item.progress || 0} className="h-2 w-[80px]" />
                            <span className="text-sm text-muted-foreground">
                              {item.completionRate || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        {t('noUpcomingDeadlines')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pending" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>{t('pendingForms')}</CardTitle>
            <CardDescription>{t('pendingFormsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('form')}</TableHead>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingForms.length > 0 ? (
                    pendingForms.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleFormClick?.(item.id)}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.categoryName || '-'}</TableCell>
                        <TableCell>{formatDate(item.date || '')}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="w-[50px]">
                          <Button variant="ghost" size="sm">
                            <FilePlus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        {t('noPendingForms')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>{t('allCategories')}</CardTitle>
            <CardDescription>{t('allCategoriesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('category')}</TableHead>
                    <TableHead>{t('deadline')}</TableHead>
                    <TableHead>{t('completion')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length > 0 ? (
                    categories.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            {formatDate(item.deadline)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={item.completionRate} className="h-2 w-[80px]" />
                            <span className="text-sm text-muted-foreground">
                              {item.completionRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="w-[50px]">
                          {navigateToDataEntry && (
                            <Button variant="ghost" size="sm" onClick={navigateToDataEntry}>
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        {t('noCategories')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default FormTabs;
