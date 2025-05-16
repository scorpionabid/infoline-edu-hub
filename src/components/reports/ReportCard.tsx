
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Report } from '@/types/report';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, BarChart, FileText, PieChart } from 'lucide-react';

interface ReportCardProps {
  report: Report;
  onView: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onView }) => {
  const { t } = useLanguage();
  
  const getReportIcon = () => {
    switch(report.type) {
      case 'analytics':
        return <BarChart className="h-5 w-5" />;
      case 'summary':
        return <PieChart className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  const getStatusBadge = () => {
    switch(report.status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getReportIcon()}
            <CardTitle className="text-md">{report.title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {report.description || t('noDescription')}
        </p>
        <div className="mt-4 text-xs text-muted-foreground">
          {t('created')}: {formatDate(report.created_at)}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 p-3">
        <Button variant="ghost" size="sm" onClick={onView} className="ml-auto">
          <Eye className="h-4 w-4 mr-1" />
          {t('view')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportCard;
