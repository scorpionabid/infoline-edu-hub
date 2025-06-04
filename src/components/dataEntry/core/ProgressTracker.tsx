
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';

export interface ProgressTrackerProps {
  columns: Column[];
  formData: Record<string, any>;
  completionPercentage: number;
  hasAllRequiredFields: boolean;
  isValid: boolean;
  className?: string;
}

/**
 * Progress Tracker komponenti - forma tamamlanma vəziyyətini göstərir
 */
const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  columns,
  formData,
  completionPercentage,
  hasAllRequiredFields,
  isValid,
  className = ''
}) => {
  const { t } = useLanguage();
  
  // Statistikalar hesablanır
  const totalFields = columns.length;
  const requiredFields = columns.filter(col => col.is_required).length;
  const completedFields = columns.filter(col => {
    const value = formData[col.id];
    return value && String(value).trim() !== '';
  }).length;
  const completedRequiredFields = columns.filter(col => {
    if (!col.is_required) return false;
    const value = formData[col.id];
    return value && String(value).trim() !== '';
  }).length;
  
  // Status təyin edilir
  const getStatusIcon = () => {
    if (hasAllRequiredFields && isValid) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    } else if (completionPercentage > 50) {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };
  
  const getStatusText = () => {
    if (hasAllRequiredFields && isValid) {
      return t('allFieldsCompleted');
    } else if (completionPercentage > 50) {
      return t('inProgress');
    } else {
      return t('notStarted');
    }
  };
  
  const getStatusColor = () => {
    if (hasAllRequiredFields && isValid) {
      return 'default';
    } else if (completionPercentage > 50) {
      return 'secondary';
    } else {
      return 'destructive';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {getStatusIcon()}
          {t('formProgress')}
          <Badge variant={getStatusColor() as any} className="ml-auto">
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ümumi irəliləyiş */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('overallProgress')}</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {t('completedFieldsCount', { completed: completedFields, total: totalFields })}
          </p>
        </div>
        
        {/* Tələb olunan sahələr */}
        {requiredFields > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('requiredFields')}</span>
              <span className="font-medium">
                {completedRequiredFields}/{requiredFields}
              </span>
            </div>
            <Progress 
              value={(completedRequiredFields / requiredFields) * 100} 
              className="h-1" 
            />
          </div>
        )}
        
        {/* Validasiya statusu */}
        <div className="flex items-center justify-between text-sm">
          <span>{t('validationStatus')}</span>
          <div className="flex items-center gap-1">
            {isValid ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">{t('valid')}</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">{t('hasErrors')}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
