
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { ExportButton } from '@/components/ui/export-button';

interface SectorHeaderProps {
  setShowDialog: (show: boolean) => void;
  handleExport: () => void;
}

const SectorHeader: React.FC<SectorHeaderProps> = ({ setShowDialog, handleExport }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isRegionAdmin } = usePermissions();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{t('sectors')}</h1>

      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setShowDialog(true)}
          className="whitespace-nowrap"
          disabled={isRegionAdmin && !user?.region_id}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addSector')}
        </Button>

        <ExportButton onExport={handleExport} />
      </div>
    </div>
  );
};

export default SectorHeader;
