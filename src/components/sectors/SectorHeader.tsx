
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Plus, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SectorHeaderProps {
  onCreateClick: () => void;
  onImport: () => void;
  onExport: () => void;
}

const SectorHeader: React.FC<SectorHeaderProps> = ({ 
  onCreateClick, 
  onImport, 
  onExport 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-2xl font-bold">{t('sectors')}</h1>
        <p className="text-muted-foreground">{t('sectorsDescription')}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {t('import')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {t('export')}
        </Button>
        <Button
          size="sm"
          onClick={onCreateClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('createSector')}
        </Button>
      </div>
    </div>
  );
};

export default SectorHeader;
