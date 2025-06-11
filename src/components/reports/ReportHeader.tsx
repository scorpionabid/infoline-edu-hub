
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportHeaderProps {
  onFiltersChange?: (filters: any) => void;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ onFiltersChange }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reports')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {t('reportsDescription')}
        </p>
      </CardContent>
    </Card>
  );
};

export default ReportHeader;
