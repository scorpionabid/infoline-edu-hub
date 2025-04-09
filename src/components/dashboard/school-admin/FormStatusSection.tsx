
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, AlertCircle } from 'lucide-react';

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
  
  // Əgər heç bir form yoxdursa, 0-a bölməni qarşısını alaq
  const dueSoonPercentage = totalCount > 0 ? Math.round((dueSoonCount / totalCount) * 100) : 0;
  const overduePercentage = totalCount > 0 ? Math.round((overdueCount / totalCount) * 100) : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-md font-medium">{t('dueSoonForms')}</CardTitle>
          <Clock className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{dueSoonCount}</span>
            <span className="text-sm text-muted-foreground">{dueSoonPercentage}% of total</span>
          </div>
          <Progress value={dueSoonPercentage} className="h-2 bg-muted" indicatorClassName="bg-blue-500" />
          <p className="text-sm text-muted-foreground mt-2">
            {t('dueSoonFormsDescription')}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-md font-medium">{t('overdueForms')}</CardTitle>
          <AlertCircle className="h-5 w-5 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{overdueCount}</span>
            <span className="text-sm text-muted-foreground">{overduePercentage}% of total</span>
          </div>
          <Progress value={overduePercentage} className="h-2 bg-muted" indicatorClassName="bg-red-500" />
          <p className="text-sm text-muted-foreground mt-2">
            {t('overdueFormsDescription')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormStatusSection;
