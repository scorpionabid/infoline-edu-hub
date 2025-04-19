import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { UserPlus, Upload, Download, Filter } from 'lucide-react';
import { H1 } from '@/components/ui/typography';
import AddUserDialog from './AddUserDialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserHeaderProps {
  onRefresh?: () => void;
  filterParams?: {
    sectorId?: string;
    regionId?: string;
  };
}

const UserHeader: React.FC<UserHeaderProps> = ({ 
  onRefresh,
  filterParams
}) => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // İstifadəçi əlavə etmə dialoqu
  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  // İstifadəçi əlavə edildikdən sonra
  const handleUserAdded = () => {
    setIsAddDialogOpen(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  // İmport dialoqu
  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  // Fayl seçimi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  // İmport funksiyası
  const handleImport = () => {
    if (!importFile) {
      toast.error(t('pleaseSelectFile'));
      return;
    }

    setIsImporting(true);
    
    // İmport əməliyyatını simulyasiya et
    setTimeout(() => {
      setIsImporting(false);
      setIsImportDialogOpen(false);
      setImportFile(null);
      toast.success(t('usersImported'));
      if (onRefresh) {
        onRefresh();
      }
    }, 2000);
  };

  // Export funksiyası
  const handleExport = () => {
    setIsExporting(true);
    
    // Export əməliyyatını simulyasiya et
    setTimeout(() => {
      setIsExporting(false);
      toast.success(t('usersExported'));
    }, 2000);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <H1>{t('users')}</H1>
        
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t('filters')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                {t('showAll')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                {t('onlyActive')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                {t('onlyInactive')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                {t('superadmins')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                {t('regionadmins')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                {t('sectoradmins')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                {t('schooladmins')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t('export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport} disabled={isExporting}>
                {isExporting ? t('exporting') : t('exportToCsv')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport} disabled={isExporting}>
                {isExporting ? t('exporting') : t('exportToExcel')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={handleOpenImportDialog}>
            <Upload className="h-4 w-4 mr-2" />
            {t('import')}
          </Button>
          
          <Button size="sm" onClick={handleOpenAddDialog}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t('addUser')}
          </Button>
        </div>
      </div>
      
      {/* İstifadəçi əlavə etmə dialoqu */}
      <AddUserDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onComplete={handleUserAdded}
        filterParams={filterParams}
      />
      
      {/* İmport dialoqu */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('importUsers')}</DialogTitle>
            <DialogDescription>
              {t('importUsersDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">{t('selectFile')}</Label>
              <Input 
                id="file" 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleFileChange}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {t('supportedFormats')}: CSV, Excel
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
              disabled={isImporting}
            >
              {t('cancel')}
            </Button>
            
            <Button
              onClick={handleImport}
              disabled={isImporting || !importFile}
            >
              {isImporting ? t('importing') : t('import')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserHeader;
