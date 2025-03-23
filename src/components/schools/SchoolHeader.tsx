
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileDown, FileUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SchoolHeaderProps {
  userRole?: string;
  onAddClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
}

const SchoolHeader: React.FC<SchoolHeaderProps> = ({
  userRole,
  onAddClick,
  onExportClick,
  onImportClick
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('schools')}</h1>
        <p className="text-muted-foreground">Məktəbləri idarə et və izlə</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        {(userRole === 'superadmin' || userRole === 'regionadmin' || userRole === 'sectoradmin') && (
          <Button onClick={onAddClick} className="gap-1">
            <Plus className="h-4 w-4" />
            Məktəb əlavə et
          </Button>
        )}
        <Button variant="outline" onClick={onExportClick} className="gap-1">
          <FileDown className="h-4 w-4" />
          Excel Export
        </Button>
        <Button variant="outline" onClick={onImportClick} className="gap-1">
          <FileUp className="h-4 w-4" />
          Excel Import
        </Button>
      </div>
    </div>
  );
};

export default SchoolHeader;
