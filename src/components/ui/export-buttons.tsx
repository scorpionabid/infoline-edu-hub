
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';

export interface ExportButtonsProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  isLoading?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportExcel,
  onExportPDF,
  onExportCSV,
  isLoading = false
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onExportExcel}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPDF}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportCSV}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <File className="h-4 w-4" />
        CSV
      </Button>
    </div>
  );
};

export default ExportButtons;
