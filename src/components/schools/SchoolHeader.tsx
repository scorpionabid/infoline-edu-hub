
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileDown, FileUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/context/AuthContext';

export interface SchoolHeaderProps {
  userRole?: Role;
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
  const canManageSchools = userRole === 'superadmin' || userRole === 'regionadmin' || userRole === 'sectoradmin';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('schools')}</h1>
        <p className="text-muted-foreground">{t('schoolsDescription')}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canManageSchools && (
          <Button onClick={onAddClick} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('addSchool')}</span>
            <span className="sm:hidden">{t('add')}</span>
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={onExportClick}
          className="flex items-center gap-1"
        >
          <FileDown className="h-4 w-4" />
          <span className="hidden sm:inline">{t('exportToExcel')}</span>
          <span className="sm:hidden">{t('export')}</span>
        </Button>
        {canManageSchools && (
          <Button 
            variant="outline" 
            onClick={onImportClick}
            className="flex items-center gap-1"
          >
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">{t('importFromExcel')}</span>
            <span className="sm:hidden">{t('import')}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SchoolHeader;
