
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { BarChart2, Plus, FileDown } from 'lucide-react';
import CreateReportDialog from './CreateReportDialog';

const ReportHeader: React.FC = () => {
  const { t } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const handleCreateClick = () => {
    setShowCreateDialog(true);
  };
  
  const handleCloseDialog = () => {
    setShowCreateDialog(false);
  };
  
  return (
    <>
      <PageHeader 
        title={t('reportTitle')}
        description={t('reportDescription')}
        children={
          <div className="flex space-x-2">
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              {t('createReport')}
            </Button>
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              {t('exportReport')}
            </Button>
          </div>
        }
      />
      
      <CreateReportDialog open={showCreateDialog} onClose={handleCloseDialog} />
    </>
  );
};

export default ReportHeader;
