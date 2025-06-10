import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, File, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReportExportService } from '@/services/reports/exportService';
import { useRoleBasedReports } from '@/hooks/reports/useRoleBasedReports';

export interface ExportButtonsProps {
  reportType: 'school-performance' | 'regional-comparison' | 'category-completion' | 'school-column-data';
  filters?: Record<string, any>;
  categoryId?: string;
  disabled?: boolean;
  className?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  reportType,
  filters = {},
  categoryId,
  disabled = false,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const { toast } = useToast();
  const { userRole, canAccessReportType } = useRoleBasedReports();

  // İcazə yoxlaması
  const canExportAdvanced = canAccessReportType('advanced');
  const canExportRegional = canAccessReportType('regional_comparison');

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      setIsExporting(true);
      setExportingFormat(format);

      let fileName: string;

      // Report type-a görə müvafiq export funksiyasını çağırırıq
      switch (reportType) {
        case 'school-performance':
          if (!canExportAdvanced) {
            toast({
              title: 'İcazə xətası',
              description: 'Bu hesabatı export etmək üçün icazəniz yoxdur.',
              variant: 'destructive'
            });
            return;
          }
          fileName = await ReportExportService.exportSchoolPerformance(format, filters);
          break;
          
        case 'regional-comparison':
          if (!canExportRegional) {
            toast({
              title: 'İcazə xətası',
              description: 'Regional müqayisə hesabatlarını export etmək üçün icazəniz yoxdur.',
              variant: 'destructive'
            });
            return;
          }
          fileName = await ReportExportService.exportRegionalComparison(format);
          break;
          
        case 'category-completion':
          if (!categoryId) {
            toast({
              title: 'Səhv',
              description: 'Kateqoriya seçilməlidir.',
              variant: 'destructive'
            });
            return;
          }
          fileName = await ReportExportService.exportCategoryCompletion(categoryId, format);
          break;
          
        case 'school-column-data':
          fileName = await ReportExportService.exportSchoolColumnData(filters, format);
          break;
          
        default:
          throw new Error(`Bilinməyən hesabat növü: ${reportType}`);
      }

      toast({
        title: 'Export uğurla tamamlandı',
        description: `Fayl yükləndi: ${fileName}`,
        variant: 'default'
      });

    } catch (error) {
      console.error('Export xətası:', error);
      toast({
        title: 'Export xətası',
        description: error instanceof Error ? error.message : 'Export zamanı xəta baş verdi',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const getButtonText = () => {
    if (isExporting) {
      return exportingFormat ? `${exportingFormat.toUpperCase()} hazırlanır...` : 'Hazırlanır...';
    }
    return 'Export Et';
  };

  const getIconByFormat = (format: string) => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />;
      case 'pdf':
        return <FileText className="mr-2 h-4 w-4 text-red-600" />;
      case 'csv':
        return <File className="mr-2 h-4 w-4 text-blue-600" />;
      default:
        return <Download className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled || isExporting}
          className={className}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {getButtonText()}
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Et
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Format seçin</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleExport('excel')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          {getIconByFormat('excel')}
          Excel (.xlsx)
          <span className="ml-auto text-xs text-muted-foreground">Məsləhət</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          {getIconByFormat('pdf')}
          PDF (.pdf)
          <span className="ml-auto text-xs text-muted-foreground">Print</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="cursor-pointer"
        >
          {getIconByFormat('csv')}
          CSV (.csv)
          <span className="ml-auto text-xs text-muted-foreground">Raw data</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          Həm də e-poçt vasitəsilə göndərmək üçün Settings-də konfigurə edin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButtons;
