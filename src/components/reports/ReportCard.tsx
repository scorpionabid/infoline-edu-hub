
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Report } from '@/types/report';
import { useLanguage } from '@/context/LanguageContext';
import { formatDate } from '@/lib/utils';

interface ReportCardProps {
  report: Report;
  onView: (reportId: string) => void;
  onDelete?: (reportId: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onView, onDelete }) => {
  const { t } = useLanguage();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{report.title}</CardTitle>
        <CardDescription>{report.description || t('noDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t('reportType')}:</span>
            <span className="font-medium">{report.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t('reportStatus')}:</span>
            <span className="font-medium">{report.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t('createdAt')}:</span>
            <span className="font-medium">{formatDate(report.created_at)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {onDelete && (
          <Button variant="outline" size="sm" onClick={() => onDelete(report.id)}>
            {t('delete')}
          </Button>
        )}
        <Button size="sm" onClick={() => onView(report.id)}>
          {t('view')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportCard;
