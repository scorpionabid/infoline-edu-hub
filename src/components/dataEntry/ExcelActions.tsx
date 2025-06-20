
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';

interface ExcelActionsProps {
  onExport?: () => void;
  onImport?: () => void;
  onTemplate?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const ExcelActions: React.FC<ExcelActionsProps> = ({
  onExport,
  onImport,
  onTemplate,
  isLoading = false,
  disabled = false
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      {onTemplate && (
        <Button
          variant="outline"
          size="sm"
          onClick={onTemplate}
          disabled={isLoading || disabled}
          className="flex items-center gap-1"
        >
          <FileSpreadsheet className="h-4 w-4" />
          {t('downloadTemplate')}
        </Button>
      )}
      
      {onImport && (
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
          disabled={isLoading || disabled}
          className="flex items-center gap-1"
        >
          <Upload className="h-4 w-4" />
          {t('import')}
        </Button>
      )}
      
      {onExport && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isLoading || disabled}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          {t('export')}
        </Button>
      )}
    </div>
  );
};

export default ExcelActions;
