
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart, LineChart, Table2, Eye, Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Report } from '@/types/report';
import { ReportType } from '@/types/form';
import { useLanguage } from '@/context/LanguageContext';

interface ReportItemProps {
  report: Report;
  onPreview: (report: Report) => void;
  onDownload: (report: Report) => void;
  onShare: (report: Report) => void;
}

export const ReportItem: React.FC<ReportItemProps> = ({ report, onPreview, onDownload, onShare }) => {
  const { t } = useLanguage();
  
  const getReportIcon = () => {
    if (report.type === "STATISTICS") {
      return <BarChart3 className="h-5 w-5 text-primary" />;
    }
    else if (report.type === "COMPLETION") {
      return <PieChart className="h-5 w-5 text-primary" />;
    }
    else if (report.type === "COMPARISON") {
      return <LineChart className="h-5 w-5 text-primary" />;
    }
    else if (report.type === "COLUMN") {
      return <Table2 className="h-5 w-5 text-primary" />;
    }
    return <BarChart3 className="h-5 w-5 text-primary" />;
  };
  
  const getReportTypeBadge = () => {
    if (report.type === "STATISTICS") {
      return <Badge variant="outline">Statistika</Badge>;
    }
    else if (report.type === "COMPLETION") {
      return <Badge variant="outline">Tamamlanma</Badge>;
    }
    else if (report.type === "COMPARISON") {
      return <Badge variant="outline">Müqayisə</Badge>;
    }
    else if (report.type === "COLUMN") {
      return <Badge variant="outline">Sütun</Badge>;
    }
    return <Badge variant="outline">Hesabat</Badge>;
  };
  
  const formattedDate = report.created_at 
    ? format(new Date(report.created_at), 'dd.MM.yyyy')
    : '';
  
  // Author üçün adaptor
  const authorName = report.created_by_name || t('system');
  
  // Son yenilənmə tarixi üçün adaptor
  const lastUpdated = report.updated_at 
    ? format(new Date(report.updated_at), 'dd.MM.yyyy')
    : '';
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getReportIcon()}
            <CardTitle className="text-lg">{report.title}</CardTitle>
          </div>
          {getReportTypeBadge()}
        </div>
        <CardDescription className="line-clamp-2">
          {report.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('createdAt')}:</span>
            <span className="font-medium">{formattedDate}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('author')}:</span>
            <span className="font-medium">{authorName}</span>
          </div>
          
          {lastUpdated && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('lastUpdated')}:</span>
              <span className="font-medium">{lastUpdated}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onPreview(report)}>
          <Eye className="h-4 w-4 mr-1" />
          {t('preview')}
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onDownload(report)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onShare(report)}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReportItem;
