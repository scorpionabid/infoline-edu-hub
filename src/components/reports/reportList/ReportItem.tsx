
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Share2, BarChart2, PieChart, TrendingUp } from 'lucide-react';
import { Report, ReportType } from '@/types/report';

interface ReportItemProps {
  report: Report;
  onPreview: (report: Report) => void;
  onDownload: (report: Report) => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ report, onPreview, onDownload }) => {
  const { t } = useLanguage();
  
  // Report type icon mapping
  const getReportIcon = (type: ReportType) => {
    switch (type) {
      case 'statistics':
        return <BarChart2 className="h-5 w-5 text-blue-500" />;
      case 'completion':
        return <PieChart className="h-5 w-5 text-green-500" />;
      case 'comparison':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <BarChart2 className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Hesabat növü tərcüməsi
  const getReportTypeTranslation = (type: ReportType): string => {
    switch (type) {
      case 'statistics':
        return t('statistics');
      case 'completion':
        return t('completion');
      case 'comparison':
        return t('comparison');
      case 'column':
        return t('column');
      case 'category':
        return t('category');
      case 'school':
        return t('school');
      case 'region':
        return t('region');
      case 'sector':
        return t('sector');
      case 'custom':
        return t('custom');
      default:
        return type;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="h-32 bg-muted flex items-center justify-center relative overflow-hidden">
          {getReportIcon(report.type)}
          <div className="absolute top-2 right-2">
            <Badge
              variant={
                report.type === 'statistics'
                  ? 'default'
                  : report.type === 'completion'
                  ? 'success'
                  : 'secondary'
              }
            >
              {getReportTypeTranslation(report.type)}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{report.title || report.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {report.description}
          </p>
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="h-3 w-3 mr-1" />
            {new Date(report.createdAt || report.created || report.dateCreated || '').toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onPreview(report)}
        >
          <Eye className="h-4 w-4 mr-1" />
          {t('preview')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onDownload(report)}
        >
          <Download className="h-4 w-4 mr-1" />
          {t('download')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-auto px-2"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportItem;
