
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { FileUp, FileDown, Plus, RefreshCcw, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

// İmport/Export dialoqları üçün komponentlər
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

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
  const [selectedExportFormat, setSelectedExportFormat] = useState<string>('excel');
  const [selectedImportTab, setSelectedImportTab] = useState<string>('upload');
  
  // Simulyasiya üçün yüklənmə statusu
  const [loading, setLoading] = useState({
    import: false,
    export: false,
    add: false
  });

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
    setLoading(prev => ({ ...prev, import: true }));
    
    // Import prosesini simulyasiya et
    setTimeout(() => {
      setLoading(prev => ({ ...prev, import: false }));
      setImportDialogOpen(false);
      toast.success(t('importSuccess'), {
        description: t('dataImportedSuccessfully')
      });
    }, 2000);
  };
  
  // Export funksiyası
  const handleExport = () => {
    setLoading(prev => ({ ...prev, export: true }));
    
    // Export prosesini simulyasiya et
    setTimeout(() => {
      setLoading(prev => ({ ...prev, export: false }));
      setExportDialogOpen(false);
      toast.success(t('exportSuccess'), {
        description: `${t('dataExportedSuccessfully')} (${selectedExportFormat.toUpperCase()})`
      });
    }, 2000);
  };
  
  // Yeni element əlavə et
  const handleAdd = (type: string) => {
    setLoading(prev => ({ ...prev, add: true }));
    
    // Əlavə etmə prosesini simulyasiya et
    setTimeout(() => {
      setLoading(prev => ({ ...prev, add: false }));
      setAddDialogOpen(false);
      toast.success(t('addSuccess'), {
        description: `${type} ${t('itemAddedSuccessfully')}`
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
            disabled={loading.import}
          >
            <Upload className="h-4 w-4" />
            <span>{loading.import ? t('importing') : t('import')}</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1"
                disabled={loading.export}
              >
                <Download className="h-4 w-4" />
                <span>{loading.export ? t('exporting') : t('export')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                setSelectedExportFormat('excel');
                setExportDialogOpen(true);
              }}>
                Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedExportFormat('csv');
                setExportDialogOpen(true);
              }}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedExportFormat('pdf');
                setExportDialogOpen(true);
              }}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
            <Button 
              size="sm" 
              variant="default" 
              className="flex items-center gap-1"
              onClick={() => setAddDialogOpen(true)}
              disabled={loading.add}
            >
              <Plus className="h-4 w-4" />
              <span>{loading.add ? t('adding') : t('add')}</span>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('importData')}</DialogTitle>
            <DialogDescription>{t('importDataDescription')}</DialogDescription>
          </DialogHeader>
          
          <Tabs value={selectedImportTab} onValueChange={setSelectedImportTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">{t('uploadFile')}</TabsTrigger>
              <TabsTrigger value="template">{t('useTemplate')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="pt-4">
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
            </TabsContent>
            
            <TabsContent value="template" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">{t('downloadTemplateDescription')}</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <FileDown className="mr-2 h-4 w-4" />
                  {t('downloadCategoryTemplate')}
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <FileDown className="mr-2 h-4 w-4" />
                  {t('downloadColumnTemplate')}
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <FileDown className="mr-2 h-4 w-4" />
                  {t('downloadSchoolTemplate')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleImport} disabled={loading.import}>
              {loading.import ? t('importing') : t('import')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('exportData')}</DialogTitle>
            <DialogDescription>
              {t('exportDataDescription')} ({selectedExportFormat.toUpperCase()})
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
                {selectedExportFormat === 'csv' && (
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="text-sm">{t('utf8Encoding')}</span>
                  </label>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t('exportContent')}</h3>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="exportType" defaultChecked />
                  <span className="text-sm">{t('currentView')}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="exportType" />
                  <span className="text-sm">{t('allData')}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="exportType" />
                  <span className="text-sm">{t('selectedItems')}</span>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleExport} disabled={loading.export}>
              {loading.export ? t('exporting') : t('export')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addNew')}</DialogTitle>
            <DialogDescription>{t('addNewDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAdd(t('category'))}
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="text-sm font-medium">{t('category')}</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAdd(t('column'))}
              >
                <div className="text-3xl mb-2">📋</div>
                <div className="text-sm font-medium">{t('column')}</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAdd(t('school'))}
              >
                <div className="text-3xl mb-2">🏫</div>
                <div className="text-sm font-medium">{t('school')}</div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => handleAdd(t('user'))}
              >
                <div className="text-3xl mb-2">👤</div>
                <div className="text-sm font-medium">{t('user')}</div>
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              {t('cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardHeader;
