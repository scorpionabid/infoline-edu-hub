
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Report } from '@/types/core/report';
import { Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

interface ReportCardProps {
  report: Report;
  onView: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onView }) => {
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{report.title}</CardTitle>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(report.status)} text-xs`}
          >
            {t(report.status)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2 text-sm">
          {report.description || t('noDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mr-1" />
            <span>{t('reportType')}: {report.type}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {t('createdAt')}: {formatDate(report.created_at)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full" 
          onClick={onView}
        >
          <Eye className="h-4 w-4 mr-2" />
          {t('viewReport')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportCard;
