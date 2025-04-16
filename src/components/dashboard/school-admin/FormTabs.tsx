
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { FormItem, FormStatus } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle, XCircle, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormTabsProps {
  forms: FormItem[];
  onFormClick: (formId: string) => void;
}

const FormTabs: React.FC<FormTabsProps> = ({ forms, onFormClick }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const formStatusValues = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    DUE_SOON: 'dueSoon',
    OVERDUE: 'overdue',
    DRAFT: 'draft',
    COMPLETED: 'completed'
  };
  
  const filteredForms = (tab: string) => {
    if (tab === 'all') return forms;
    
    if (tab === 'due_soon') {
      return forms.filter(form => form.status === formStatusValues.DUE_SOON);
    }
    
    return forms.filter(form => form.status.toString().toLowerCase() === tab);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case formStatusValues.PENDING:
        return <Clock className="h-4 w-4 mr-1" />;
      case formStatusValues.APPROVED:
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case formStatusValues.REJECTED:
        return <XCircle className="h-4 w-4 mr-1" />;
      case formStatusValues.DUE_SOON:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case formStatusValues.OVERDUE:
        return <Calendar className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case formStatusValues.PENDING:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case formStatusValues.APPROVED:
        return 'bg-green-100 text-green-800 border-green-300';
      case formStatusValues.REJECTED:
        return 'bg-red-100 text-red-800 border-red-300';
      case formStatusValues.DUE_SOON:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case formStatusValues.OVERDUE:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const formatStatusText = (status: string) => {
    switch (status) {
      case formStatusValues.PENDING:
        return t('pending');
      case formStatusValues.APPROVED:
        return t('approved');
      case formStatusValues.REJECTED:
        return t('rejected');
      case formStatusValues.DUE_SOON:
        return t('dueSoon');
      case formStatusValues.OVERDUE:
        return t('expired');
      case formStatusValues.DRAFT:
        return t('draft');
      case formStatusValues.COMPLETED:
        return t('completed');
      default:
        return status;
    }
  };

  return (
    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-5">
        <TabsTrigger value="all">{t('all')}</TabsTrigger>
        <TabsTrigger value="pending">{t('pending')}</TabsTrigger>
        <TabsTrigger value="approved">{t('approved')}</TabsTrigger>
        <TabsTrigger value="rejected">{t('rejected')}</TabsTrigger>
        <TabsTrigger value="due_soon">{t('dueSoon')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="mt-4">
        <Card>
          <CardContent className="p-6">
            <ScrollArea className="h-[400px] pr-4">
              {filteredForms(activeTab).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noFormsFound')}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredForms(activeTab).map((form) => (
                    <div 
                      key={form.id} 
                      className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => onFormClick(form.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-lg">{form.title}</h3>
                          {form.category && (
                            <p className="text-sm text-muted-foreground">{form.category}</p>
                          )}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(typeof form.status === 'string' ? form.status : '')}
                        >
                          {getStatusIcon(typeof form.status === 'string' ? form.status : '')}
                          {formatStatusText(typeof form.status === 'string' ? form.status : '')}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{t('completion')}</span>
                          <span>{form.completionPercentage}%</span>
                        </div>
                        <Progress value={form.completionPercentage} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {form.date}
                        </span>
                        <Button size="sm" variant="outline">
                          {t('view')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default FormTabs;
