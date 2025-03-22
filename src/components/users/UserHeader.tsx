import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { UserPlus, Upload, Download, Filter } from 'lucide-react';
import { H1 } from '@/components/ui/typography';
import AddUserDialog from './AddUserDialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const UserHeader = () => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [loading, setLoading] = React.useState({
    import: false,
    export: false
  });

  // İmport funksiyası
  const handleImport = () => {
    setLoading(prev => ({ ...prev, import: true }));
    
    // İmport əməliyyatını simulyasiya et
    setTimeout(() => {
      setLoading(prev => ({ ...prev, import: false }));
      toast.success(t('usersImported'), {
        description: t('usersImportedDesc')
      });
    }, 1500);
  };
  
  // Export funksiyası
  const handleExport = (format: string) => {
    setLoading(prev => ({ ...prev, export: true }));
    
    // Export əməliyyatını simulyasiya et
    setTimeout(() => {
      setLoading(prev => ({ ...prev, export: false }));
      toast.success(t('usersExported'), { 
        description: t('usersExportedFormat', { format: format.toUpperCase() })
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <H1>{t('usersManagement')}</H1>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('export')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline"
          onClick={handleImport}
          disabled={loading.import}
        >
          <Upload className="mr-2 h-4 w-4" />
          {loading.import ? t('importing') : t('import')}
        </Button>
        
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="size-4" />
          <span>{t('addUser')}</span>
        </Button>
      </div>

      <AddUserDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  );
};

export default UserHeader;
