
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryWithColumns } from '@/types/column';
import EntryField from './EntryField';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CategoryFormProps {
  category: CategoryWithColumns;
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (columnId: string, value: string | boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isApproved: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  completionPercentage: number;
  showValidationErrors: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  values,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
  isApproved,
  isRejected,
  rejectionReason,
  completionPercentage,
  showValidationErrors
}) => {
  const { t } = useLanguage();
  const [sections, setSections] = useState<Record<string, any[]>>({});
  const [hasDeadline, setHasDeadline] = useState(false);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  // Sütunları bölmələrə görə qruplaşdırma
  useEffect(() => {
    const sectionedColumns: Record<string, any[]> = { 'default': [] };

    if (category?.columns?.length) {
      category.columns.forEach((column) => {
        const sectionKey = column.section || 'default';
        if (!sectionedColumns[sectionKey]) {
          sectionedColumns[sectionKey] = [];
        }
        sectionedColumns[sectionKey].push(column);
      });
    }

    setSections(sectionedColumns);
  }, [category]);

  // Son tarix hesablamaları
  useEffect(() => {
    if (category?.deadline) {
      setHasDeadline(true);
      const deadlineDate = new Date(category.deadline);
      const now = new Date();
      setIsDeadlinePassed(now > deadlineDate);

      if (!isDeadlinePassed) {
        // Son tarixə qalan vaxtı hesablama
        const timeRemaining = deadlineDate.getTime() - now.getTime();
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days} ${t('days')} ${hours} ${t('hours')}`);
        } else if (hours > 0) {
          setTimeLeft(`${hours} ${t('hours')}`);
        } else {
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${minutes} ${t('minutes')}`);
        }
      } else {
        setTimeLeft(null);
      }
    } else {
      setHasDeadline(false);
      setTimeLeft(null);
    }
  }, [category, t]);

  // Məlumatları doldurmaq üçün enabled olub-olmaması
  const isFormDisabled = isApproved || isSubmitting;

  return (
    <Card className="w-full">
      <CardHeader className="bg-muted/30">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {category.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {completionPercentage < 100 && !isApproved && !isRejected && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {t('inProgress')}
                </Badge>
              )}
              
              {completionPercentage === 100 && !isApproved && !isRejected && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {t('completed')}
                </Badge>
              )}
              
              {isApproved && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {t('approved')}
                </Badge>
              )}
              
              {isRejected && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {t('rejected')}
                </Badge>
              )}
            </div>
          </div>
          
          {category.description && (
            <CardDescription>{category.description}</CardDescription>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Progress value={completionPercentage} className="w-24 h-2" />
              <span className="text-xs text-muted-foreground">{completionPercentage}%</span>
            </div>
            
            {hasDeadline && (
              <div className={cn(
                "flex items-center gap-1 text-xs", 
                isDeadlinePassed ? "text-red-500" : "text-amber-600"
              )}>
                <Calendar className="h-3 w-3" />
                <span>
                  {isDeadlinePassed 
                    ? `${t('deadline')}: ${format(new Date(category.deadline!), 'dd.MM.yyyy')} (${t('expired')})`
                    : `${t('deadline')}: ${format(new Date(category.deadline!), 'dd.MM.yyyy')} (${timeLeft} ${t('left')})`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isRejected && rejectionReason && (
        <Alert variant="destructive" className="mx-6 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('rejectedTitle')}</AlertTitle>
          <AlertDescription>{rejectionReason}</AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className={cn("max-h-[60vh]", isRejected && "mt-2")}>
        <CardContent className="pt-4">
          <div className="space-y-6">
            {Object.entries(sections).map(([sectionName, columns]) => (
              <div key={sectionName} className="space-y-3">
                {sectionName !== 'default' && (
                  <>
                    <h3 className="text-base font-medium">{sectionName}</h3>
                    <Separator />
                  </>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {columns.map((column) => (
                    <EntryField
                      key={column.id}
                      column={column}
                      value={values[column.id] || ''}
                      onChange={(value) => onChange(column.id, value)}
                      error={showValidationErrors ? errors[column.id] : undefined}
                      readOnly={isFormDisabled}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </ScrollArea>
      
      <CardFooter className="bg-muted/30 flex justify-between px-6 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          {completionPercentage === 100
            ? t('allFieldsCompleted')
            : t('requiredFieldsNotice')
          }
        </div>
        <Button 
          onClick={onSubmit} 
          disabled={isFormDisabled || completionPercentage < 100}
          className="ml-auto"
        >
          {isApproved ? t('approved') : (isSubmitting ? t('saving') : t('saveChanges'))}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryForm;
