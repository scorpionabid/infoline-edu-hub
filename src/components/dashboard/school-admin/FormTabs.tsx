
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { FormTabsProps } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-500';
      case 'in_progress':
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Tabs defaultValue="categories" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="categories">{t('categories')}</TabsTrigger>
        <TabsTrigger value="deadlines">{t('deadlines')}</TabsTrigger>
        <TabsTrigger value="pending">{t('pendingForms')}</TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="space-y-4">
        <div className="grid gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onCategoryChange(category.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(category.status)}
                    {category.name}
                  </CardTitle>
                  <Badge className={getStatusColor(category.status)}>
                    {t(category.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{t('progress')}</span>
                    <span>{Math.round(category.completion)}%</span>
                  </div>
                  <Progress value={category.completion} className="h-2" />
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{category.completedFields}/{category.totalFields} {t('fieldsCompleted')}</span>
                    {category.lastUpdated && (
                      <span>{t('lastUpdated')}: {new Date(category.lastUpdated).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToDataEntry();
                    }}
                    className="w-full"
                    variant={category.status === 'completed' ? 'outline' : 'default'}
                  >
                    {category.status === 'completed' ? t('review') : t('continueEditing')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="deadlines" className="space-y-4">
        <div className="grid gap-4">
          {upcoming.map((deadline) => (
            <Card key={deadline.id} className={`border-l-4 ${
              deadline.status === 'overdue' ? 'border-l-red-500' : 
              deadline.priority === 'high' ? 'border-l-orange-500' : 'border-l-blue-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {deadline.title}
                  </CardTitle>
                  <Badge variant={deadline.status === 'overdue' ? 'destructive' : 'secondary'}>
                    {deadline.daysLeft > 0 ? `${deadline.daysLeft} ${t('daysLeft')}` : t('overdue')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {t('deadline')}: {new Date(deadline.deadline).toLocaleDateString()}
                  </div>
                  <Badge variant="outline" className={
                    deadline.priority === 'high' ? 'text-red-600' :
                    deadline.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                  }>
                    {t(deadline.priority)} {t('priority')}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="pending" className="space-y-4">
        <div className="grid gap-4">
          {pendingForms.map((form) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleFormClick(form.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{form.title}</CardTitle>
                  <Badge className={getStatusColor(form.status)}>
                    {t(form.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('progress')}</span>
                    <span>{form.progress}%</span>
                  </div>
                  <Progress value={form.progress} className="h-2" />
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('category')}: {form.category}</span>
                    <span>{t('lastModified')}: {new Date(form.lastModified).toLocaleDateString()}</span>
                  </div>
                  
                  {form.assignedTo && (
                    <div className="text-sm text-muted-foreground">
                      {t('assignedTo')}: {form.assignedTo}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default FormTabs;
