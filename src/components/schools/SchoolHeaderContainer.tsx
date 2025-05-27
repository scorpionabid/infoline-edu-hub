import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';

interface SchoolHeaderContainerProps {
  onAdd: () => void;
  onExport: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  canManageSchools: boolean;
  schoolsCount: number;
}

const SchoolHeaderContainer: React.FC<SchoolHeaderContainerProps> = ({
  onAdd,
  onExport,
  onRefresh,
  isLoading,
  canManageSchools,
  schoolsCount
}) => {
  const { t } = useLanguageSafe();

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0 gap-4">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onAdd}
          disabled={isLoading || !canManageSchools}
          className="text-xs sm:text-sm"
        >
          <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{t('addSchool')}</span>
          <span className="sm:hidden">{t('add')}</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onExport}
          disabled={isLoading || schoolsCount === 0}
          className="text-xs sm:text-sm"
        >
          <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{t('export')}</span>
          <span className="sm:hidden">{t('export')}</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs sm:text-sm"
        >
          <RefreshCw className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{t('refresh')}</span>
          <span className="sm:hidden">{t('refresh')}</span>
        </Button>
      </div>
    </div>
  );
};

export default SchoolHeaderContainer;
