import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText, File, Loader2 } from 'lucide-react';

export interface ExportButtonsProps {
  onExportExcel: () => void;
  onExportPDF?: () => void;
  onExportCSV: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPDF,
  onExportCSV,
  isLoading = false,
  disabled = false
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onExportExcel}
        disabled={isLoading || disabled}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        // Excel
      </Button>
      {onExportPDF && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPDF}
          disabled={isLoading || disabled}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          // PDF
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onExportCSV}
        disabled={isLoading || disabled}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <File className="h-4 w-4" />
        )}
        // CSV
      </Button>
    </div>
  );
};

export default ExportButtons;