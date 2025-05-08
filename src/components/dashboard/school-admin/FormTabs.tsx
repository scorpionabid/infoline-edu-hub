
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';
import { formatDate, formatDistanceToDeadline } from '@/utils/formatters';

interface FormTabsProps {
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  onFormClick?: (id: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({ 
  categories = [], 
  upcoming = [], 
  pendingForms = [],
  onFormClick 
}) => {
  const { t } = useLanguage();

  const handleFormClick = (id: string) => {
    if (onFormClick) {
      onFormClick(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'upcoming':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" /> Qarşıdan gələn</Badge>;
      case 'due':
        return <Badge className="bg-amber-500"><AlertTriangle className="h-3 w-3 mr-1" /> Bu gün</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Gecikmiş</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="h-3 w-3 mr-1" /> Gözləmədə</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Təsdiqlənib</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" /> Rədd edilib</Badge>;
      case 'draft':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Qaralama</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <TabsContent value="upcoming" className="mt-0">
        {upcoming.length > 0 ? (
          <div className="grid gap-4">
            {upcoming.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleFormClick(item.categoryId)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{item.categoryName || item.category}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="text-sm text-muted-foreground flex gap-2 items-center mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Son tarix: {formatDate(item.deadline)}</span>
                    <span className="font-medium">
                      ({formatDistanceToDeadline(item.deadline)})
                    </span>
                  </div>
                  {item.completionRate !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tamamlama</span>
                        <span>{item.completionRate}%</span>
                      </div>
                      <Progress value={item.completionRate} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <CheckCircle className="h-12 w-12 text-green-500 mb-2 opacity-50" />
              <p className="text-muted-foreground">{t('noUpcomingDeadlines')}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="pending" className="mt-0">
        {pendingForms.length > 0 ? (
          <div className="grid gap-4">
            {pendingForms.map((form) => (
              <Card 
                key={form.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleFormClick(form.categoryId)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{form.title || form.categoryName || form.category}</h3>
                    {getStatusBadge(form.status)}
                  </div>
                  {form.deadline && (
                    <div className="text-sm text-muted-foreground flex gap-2 items-center">
                      <Calendar className="h-4 w-4" />
                      <span>Son tarix: {formatDate(form.deadline)}</span>
                    </div>
                  )}
                  {form.submittedAt && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Təqdim edilib: {formatDate(form.submittedAt)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <CheckCircle className="h-12 w-12 text-green-500 mb-2 opacity-50" />
              <p className="text-muted-foreground">{t('noPendingForms')}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="categories" className="mt-0">
        {categories && categories.length > 0 ? (
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleFormClick(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    {getStatusBadge(category.status)}
                  </div>
                  
                  {(category.deadline || category.dueDate) && (
                    <div className="text-sm text-muted-foreground flex gap-2 items-center mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Son tarix: {formatDate(category.deadline || category.dueDate || '')}</span>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tamamlama</span>
                      <span>{category.completionRate || category.progress || 0}%</span>
                    </div>
                    <Progress value={category.completionRate || category.progress || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-2 opacity-50" />
              <p className="text-muted-foreground">{t('noCategories')}</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </>
  );
};

export default FormTabs;
