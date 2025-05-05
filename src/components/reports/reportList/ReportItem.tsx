
import React from 'react';
import { Report } from '@/types/report';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportTypeValues } from '@/types/report';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { PieChart, BarChart, LineChart, Table, Eye, Edit, Trash, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ReportItemProps {
  report: Report;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const ReportItem: React.FC<ReportItemProps> = ({
  report,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const { t } = useLanguage();
  
  const getReportIcon = () => {
    switch (report.type) {
      case ReportTypeValues.BAR:
        return (
          <div className="p-2 bg-blue-100 rounded-md">
            <BarChart className="h-5 w-5 text-blue-600" />
          </div>
        );
      case ReportTypeValues.PIE:
        return (
          <div className="p-2 bg-green-100 rounded-md">
            <PieChart className="h-5 w-5 text-green-600" />
          </div>
        );
      case ReportTypeValues.LINE:
        return (
          <div className="p-2 bg-purple-100 rounded-md">
            <LineChart className="h-5 w-5 text-purple-600" />
          </div>
        );
      case ReportTypeValues.TABLE:
        return (
          <div className="p-2 bg-amber-100 rounded-md">
            <Table className="h-5 w-5 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-md">
            <BarChart className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };
  
  const getStatusBadge = () => {
    switch (report.status) {
      case 'published':
        return <Badge variant="default">{t('published')}</Badge>;
      case 'draft':
        return <Badge variant="outline">{t('draft')}</Badge>;
      case 'archived':
        return <Badge variant="secondary">{t('archived')}</Badge>;
      default:
        return <Badge variant="outline">{t('unknown')}</Badge>;
    }
  };
  
  const formatDate = (date: string | undefined) => {
    if (!date) return t('unknown');
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return t('unknown');
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {getReportIcon()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{report.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {report.description || t('noDescription')}
                </p>
              </div>
              {getStatusBadge()}
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs text-muted-foreground">
                {t('created')}: {formatDate(report.createdAt || report.created_at)}
                {report.createdBy || report.created_by ? ` ${t('by')} ${report.createdBy || report.created_by}` : ''}
              </div>
              
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => onView(report.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('view')}</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(report.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('edit')}</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => onDuplicate(report.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('duplicate')}</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(report.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('delete')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportItem;
