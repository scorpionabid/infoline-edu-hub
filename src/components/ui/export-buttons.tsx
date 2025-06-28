import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  File, 
  Loader2, 
  Eye,
  Database,
  ChevronDown,
  Settings
} from 'lucide-react';

export interface ExportButtonsProps {
  onExportExcel: (exportType: 'visible' | 'all') => void;
  onExportPDF?: (exportType: 'visible' | 'all') => void;
  onExportCSV: (exportType: 'visible' | 'all') => void;
  isLoading?: boolean;
  disabled?: boolean;
  visibleCount?: number;
  totalCount?: number;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPDF,
  onExportCSV,
  isLoading = false,
  disabled = false,
  visibleCount = 0,
  totalCount = 0
}) => {
  const [exportType, setExportType] = useState<'visible' | 'all'>('visible');

  const handleExportExcel = () => onExportExcel(exportType);
  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF(exportType);
    }
  };
  const handleExportCSV = () => onExportCSV(exportType);

  return (
    <div className="flex items-center gap-2">
      {/* Export Type Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || disabled}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {exportType === 'visible' ? (
              <>
                <Eye className="h-4 w-4" />
                Görünən ({visibleCount})
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Hamısı ({totalCount})
              </>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export növü seçin</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setExportType('visible')}
            className={exportType === 'visible' ? 'bg-muted' : ''}
          >
            <Eye className="h-4 w-4 mr-2" />
            Görünən nəticələr ({visibleCount} məktəb)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setExportType('all')}
            className={exportType === 'all' ? 'bg-muted' : ''}
          >
            <Database className="h-4 w-4 mr-2" />
            Bütün məlumatlar ({totalCount} məktəb)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Buttons */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          disabled={isLoading || disabled}
          className="flex items-center gap-2"
          title="Excel formatında export"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          Excel
        </Button>
        
        {onExportPDF && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isLoading || disabled}
            className="flex items-center gap-2"
            title="PDF formatında export"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            PDF
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={isLoading || disabled}
          className="flex items-center gap-2"
          title="CSV formatında export"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <File className="h-4 w-4" />
          )}
          CSV
        </Button>
      </div>
    </div>
  );
};

export default ExportButtons;
