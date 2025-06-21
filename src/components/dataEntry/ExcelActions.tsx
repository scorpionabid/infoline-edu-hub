import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface ExcelActionsProps {
  onImport: () => void;
  onExport: () => void;
}

const ExcelActions: React.FC<ExcelActionsProps> = ({ onImport, onExport }) => {
  const { t } = useTranslation();

  return (
    <div className="flex space-x-2">
      <Button onClick={onImport}>
        <Upload className="h-4 w-4 mr-2" />
        {t('importData')}
      </Button>
      <Button variant="outline" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        {t('exportData')}
      </Button>
    </div>
  );
};

export default ExcelActions;
