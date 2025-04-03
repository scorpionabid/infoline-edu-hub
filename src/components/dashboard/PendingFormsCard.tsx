
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { FormItem } from '@/types/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { File, AlertTriangle, Clock } from 'lucide-react';

interface PendingFormsCardProps {
  forms: FormItem[];
  onViewForm?: (formId: string) => void;
}

const PendingFormsCard: React.FC<PendingFormsCardProps> = ({ forms, onViewForm }) => {
  const { t } = useLanguage();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <File className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'dueSoon':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pendingForms')}</CardTitle>
      </CardHeader>
      <CardContent>
        {forms && forms.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {forms.map((form) => (
                <div 
                  key={form.id} 
                  className="flex items-start justify-between bg-card border rounded-md p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="pt-1">
                      {getStatusIcon(form.status)}
                    </div>
                    <div>
                      <h4 className="font-medium">{form.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{form.filledCount}/{form.totalCount} {t('fields')}</span>
                        <span>•</span>
                        <span className={cn(
                          form.status === 'overdue' && 'text-red-500',
                          form.status === 'dueSoon' && 'text-amber-500'
                        )}>
                          {form.status === 'overdue' ? t('overdue') : t('deadline')}: {new Date(form.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {onViewForm && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onViewForm(form.id)}
                    >
                      {t('view')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <File className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">{t('noPendingForms')}</h3>
            <p className="text-sm text-muted-foreground/70 max-w-xs mt-2">
              {t('allFormsCompleted')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingFormsCard;
