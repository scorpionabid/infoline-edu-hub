
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FileUp, FileDown, Plus, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

// İmport/Export dialoqları üçün komponentlər əlavə ediləcək
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

interface DashboardHeaderProps {
  className?: string;
  onRefresh?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  className, 
  onRefresh 
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  // Dialog açılıb/bağlanması üçün state-lər
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Simulyasiya üçün yüklənmə statusu
  const [loading, setLoading] = useState(false);

  // Cari vaxtı yeniləmək üçün interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // hər dəqiqə yenilə
    
    return () => clearInterval(timer);
  }, []);

  // Tarixi formatla
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(
      t('currentLanguage') === 'az' ? 'az-AZ' : 
      t('currentLanguage') === 'ru' ? 'ru-RU' : 
      t('currentLanguage') === 'tr' ? 'tr-TR' : 'en-US', 
      { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }
    );
  };
  
  // Import funksiyası
  const handleImport = () => {
    setLoading(true);
    
    // Import prosesini simulyasiya et
    setTimeout(() => {
      setLoading(false);
      setImportDialogOpen(false);
      toast.success(t('importSuccess'), {
        description: t('dataImportedSuccessfully')
      });
    }, 2000);
  };
  
  // Export funksiyası
  const handleExport = () => {
    setLoading(true);
    
    // Export prosesini simulyasiya et
    setTimeout(() => {
      setLoading(false);
      setExportDialogOpen(false);
      toast.success(t('exportSuccess'), {
        description: t('dataExportedSuccessfully')
      });
    }, 2000);
  };
  
  // Yeni element əlavə et
  const handleAdd = () => {
    setLoading(true);
    
    // Əlavə etmə prosesini simulyasiya et
    setTimeout(() => {
      setLoading(false);
      setAddDialogOpen(false);
      toast.success(t('addSuccess'), {
        description: t('itemAddedSuccessfully')
      });
    }, 1500);
  };
  
  // Yeniləmə funksiyası
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    toast.info(t('refreshing'));
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('dashboard')}</h1>
          <p className="text-muted-foreground">{t('welcomeBack')}, {user?.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{formatDate(currentDateTime)}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => setImportDialogOpen(true)}
          >
            <FileUp className="h-4 w-4" />
            <span>{t('import')}</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => setExportDialogOpen(true)}
          >
            <FileDown className="h-4 w-4" />
            <span>{t('export')}</span>
          </Button>
          
          {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
            <Button 
              size="sm" 
              variant="default" 
              className="flex items-center gap-1"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>{t('add')}</span>
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="flex items-center gap-1"
            onClick={handleRefresh}
          >
            <RefreshCcw className="h-4 w-4" />
            <span>{t('refresh')}</span>
          </Button>
        </div>
      </div>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('importData')}</DialogTitle>
            <DialogDescription>{t('importDataDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center border-2 border-dashed rounded-md p-8">
              <div className="text-center">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">{t('dragAndDropFiles')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('orClickToSelect')}</p>
                <Button variant="outline" size="sm" className="mt-4">
                  {t('selectFile')}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleImport} disabled={loading}>
              {loading ? t('importing') : t('import')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('exportData')}</DialogTitle>
            <DialogDescription>{t('exportDataDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t('exportFormat')}</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="flex-1">Excel (.xlsx)</Button>
                <Button variant="outline" size="sm" className="flex-1">CSV</Button>
                <Button variant="outline" size="sm" className="flex-1">PDF</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t('exportOptions')}</h3>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox" defaultChecked />
                  <span className="text-sm">{t('includeHeaders')}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="form-checkbox" defaultChecked />
                  <span className="text-sm">{t('includeMetadata')}</span>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              {loading ? t('exporting') : t('export')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addNew')}</DialogTitle>
            <DialogDescription>{t('addNewDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-sm font-medium">{t('category')}</div>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-sm font-medium">{t('column')}</div>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <div className="text-3xl mb-2">🏫</div>
                <div className="text-sm font-medium">{t('school')}</div>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                <div className="text-3xl mb-2">👤</div>
                <div className="text-sm font-medium">{t('user')}</div>
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAdd} disabled={loading}>
              {loading ? t('adding') : t('continue')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardHeader;
