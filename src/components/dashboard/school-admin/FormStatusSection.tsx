
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface FormStatusSectionProps {
  dueSoonCount: number;
  overdueCount: number;
  totalCount: number;
}

const FormStatusSection: React.FC<FormStatusSectionProps> = ({
  dueSoonCount,
  overdueCount,
  totalCount
}) => {
  const { t } = useLanguage();
  
  // Tamamlanma faizini hesablayaq
  const duePercentage = totalCount > 0 ? Math.round((dueSoonCount / totalCount) * 100) : 0;
  const overduePercentage = totalCount > 0 ? Math.round((overdueCount / totalCount) * 100) : 0;
  const completedPercentage = 100 - duePercentage - overduePercentage;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-blue-500" />
            {t('dueSoon')}
          </CardTitle>
          <CardDescription>{t('dueSoonDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{dueSoonCount}</div>
          <div className="text-sm text-muted-foreground">
            {duePercentage}% {t('ofTotalForms')}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
            {t('overdue')}
          </CardTitle>
          <CardDescription>{t('overdueDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{overdueCount}</div>
          <div className="text-sm text-muted-foreground">
            {overduePercentage}% {t('ofTotalForms')}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            {t('onTime')}
          </CardTitle>
          <CardDescription>{t('onTimeDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{totalCount - dueSoonCount - overdueCount}</div>
          <div className="text-sm text-muted-foreground">
            {completedPercentage}% {t('ofTotalForms')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormStatusSection;
