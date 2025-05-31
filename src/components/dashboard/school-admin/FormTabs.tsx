
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '@/context/LanguageContext';
import { FormTabsProps } from '@/types/dashboard';
import { CalendarDays, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const FormTabs: React.FC<FormTabsProps> = ({
  categories,
  upcoming,
  pendingForms,
  navigateToDataEntry,
  handleFormClick,
  onCategoryChange
}) => {
  const { t } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">{t('completed')}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('pending')}</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">{t('inProgress')}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">{t('rejected')}</Badge>;
      default:
        return <Badge variant="secondary">{t('notStarted')}</Badge>;
    }
  };

  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="categories" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t('categories')}
        </TabsTrigger>
        <TabsTrigger value="deadlines" className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {t('deadlines')}
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {t('pendingForms')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="mt-4">
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(category.status)}
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(category.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>{t('progress')}</span>
                    <span>{Math.round(category.completion || category.completionRate || 0)}%</span>
                  </div>
                  <Progress 
                    value={category.completion || category.completionRate || 0} 
                    className="h-2" 
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      {category.completedFields || 0} / {category.totalFields || 0} {t('fieldsCompleted')}
                    </span>
                    {category.lastUpdated && (
                      <span>
                        {t('lastUpdated')}: {new Date(category.lastUpdated).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => {
                        onCategoryChange(category.id);
                        navigateToDataEntry();
                      }}
                      className="flex-1"
                    >
                      {category.status === 'not_started' ? t('startEntry') : t('continueEntry')}
                    </Button>
                    {category.deadline && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {t('deadline')}: {new Date(category.deadline).toLocaleDateString()}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="deadlines" className="mt-4">
        <div className="grid gap-3">
          {upcoming.map((deadline) => (
            <Card key={deadline.id} className="border-l-4 border-l-orange-500">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{deadline.title || deadline.name}</h4>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      {deadline.deadline}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      {deadline.daysLeft > 0 
                        ? `${deadline.daysLeft} ${t('daysLeft')}`
                        : t('overdue')
                      }
                    </div>
                  </div>
                  <Badge 
                    variant={deadline.priority === 'high' ? 'destructive' : 'secondary'}
                  >
                    {t(deadline.priority)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="pending" className="mt-4">
        <div className="grid gap-3">
          {pendingForms.map((form) => (
            <Card key={form.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{form.title || form.name}</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      {form.category}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t('lastModified')}: {form.lastModified}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(form.status)}
                    <div className="text-xs text-muted-foreground mt-1">
                      {form.progress}% {t('completed')}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => handleFormClick(form.id)}
                >
                  {t('viewForm')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default FormTabs;
