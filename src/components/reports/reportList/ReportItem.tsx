
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, BarChart, PieChart, LineChart, Table, MoreHorizontal, Download, Share2, Pencil, Archive, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { Report, ReportTypeValues } from '@/types/report';

interface ReportItemProps {
  report: Report;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
  onArchive: (id: string) => void;
}

export const ReportItem: React.FC<ReportItemProps> = ({
  report,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onShare,
  onArchive
}) => {
  const { t } = useLanguage();

  const getReportIcon = () => {
    switch (report.type) {
      case ReportTypeValues.BAR:
        return <BarChart className="h-6 w-6 text-primary" />;
      case ReportTypeValues.PIE:
        return <PieChart className="h-6 w-6 text-primary" />;
      case ReportTypeValues.LINE:
        return <LineChart className="h-6 w-6 text-primary" />;
      case ReportTypeValues.TABLE:
        return <Table className="h-6 w-6 text-primary" />;
      default:
        return <BarChart className="h-6 w-6 text-primary" />;
    }
  };

  const getReportTypeLabel = () => {
    switch (report.type) {
      case ReportTypeValues.BAR:
        return t('barChart');
      case ReportTypeValues.PIE:
        return t('pieChart');
      case ReportTypeValues.LINE:
        return t('lineChart');
      case ReportTypeValues.TABLE:
        return t('tableReport');
      default:
        return t('report');
    }
  };

  const getStatusBadge = () => {
    switch (report.status) {
      case 'published':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('published')}</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('draft')}</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{t('archived')}</Badge>;
      default:
        return null;
    }
  };

  const isArchived = report.status === 'archived';
  // Use title property if it exists, otherwise use name
  const reportTitle = 'title' in report ? report.title : (report.name || '');

  return (
    <Card className={cn(
      "overflow-hidden transition-shadow hover:shadow-md",
      isArchived && "opacity-70"
    )}>
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getReportIcon()}
              <div>
                <h3 className="font-semibold">{reportTitle}</h3>
                <p className="text-sm text-muted-foreground">{getReportTypeLabel()}</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
          {report.description && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {report.description}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/30 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {t('created')}: {format(new Date(report.created_at || new Date()), 'PPP')}
          {report.created_by ? ` ${t('by')} ${report.created_by}` : ''}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(report.id)}>
            <Eye className="h-4 w-4 mr-1" />
            {t('view')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDownload(report.id)}>
                <Download className="h-4 w-4 mr-2" />
                {t('download')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(report.id)}>
                <Share2 className="h-4 w-4 mr-2" />
                {t('share')}
              </DropdownMenuItem>
              {!isArchived && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(report.id)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onArchive(report.id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    {t('archive')}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(report.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReportItem;
