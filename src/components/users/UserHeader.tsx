
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { UserPlus, Upload, Download, Filter, Building2, MapPin, School } from 'lucide-react';
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

interface UserHeaderProps {
  entityTypes?: Array<'region' | 'sector' | 'school'>;
  onUserAddedOrEdited?: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ 
  entityTypes = [],
  onUserAddedOrEdited
}) => {
  const { t } = useLanguage();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [selectedEntityType, setSelectedEntityType] = React.useState<'region' | 'sector' | 'school' | undefined>(undefined);
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
      setImportDialogOpen(false);
      toast.success(t('usersImported'));
    }, 1500);
  };
  
  // Export funksiyası
  const handleExport = (format: string) => {
    setLoading(prev => ({ ...prev, export: true }));
    
    // Export əməliyyatını simulyasiya et
    setTimeout(() => {
      setLoading(prev => ({ ...prev, export: false }));
      toast.success(t('usersExported'));
    }, 1500);
  };

  // Xüsusi tip istifadəçi əlavə etmək üçün
  const handleAddEntityAdmin = (type: 'region' | 'sector' | 'school') => {
    setSelectedEntityType(type);
    setShowAddDialog(true);
  };

  // Sadəcə istifadəçi əlavə etmək üçün
  const handleAddUser = () => {
    setSelectedEntityType(undefined);
    setShowAddDialog(true);
  };

  // İstifadəçi əlavə edildikdən sonra
  const handleUserAdded = () => {
    if (onUserAddedOrEdited) {
      onUserAddedOrEdited();
    }
    
    // Həmçinin, global event kimi göndərək ki, digər komponentlər də xəbərdar olsun
    const event = new CustomEvent('user-added-or-edited');
    window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <H1>{t('usersManagement')}</H1>
      
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline"
              disabled={loading.export}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading.export ? t('exporting') : t('export')}
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
          onClick={() => setImportDialogOpen(true)}
          disabled={loading.import}
        >
          <Upload className="mr-2 h-4 w-4" />
          {loading.import ? t('importing') : t('import')}
        </Button>
        
        {entityTypes.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('addNew')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {entityTypes.includes('region') && (
                <DropdownMenuItem onClick={() => handleAddEntityAdmin('region')}>
                  <Building2 className="mr-2 h-4 w-4" />
                  {t('addRegionWithAdmin')}
                </DropdownMenuItem>
              )}
              
              {entityTypes.includes('sector') && (
                <DropdownMenuItem onClick={() => handleAddEntityAdmin('sector')}>
                  <MapPin className="mr-2 h-4 w-4" />
                  {t('addSectorWithAdmin')}
                </DropdownMenuItem>
              )}
              
              {entityTypes.includes('school') && (
                <DropdownMenuItem onClick={() => handleAddEntityAdmin('school')}>
                  <School className="mr-2 h-4 w-4" />
                  {t('addSchoolWithAdmin')}
                </DropdownMenuItem>
              )}
              
              {entityTypes.length > 0 && (
                <DropdownMenuSeparator />
              )}
              
              <DropdownMenuItem onClick={handleAddUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t('addUser')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={handleAddUser}
            className="flex items-center gap-2"
          >
            <UserPlus className="size-4" />
            <span>{t('addUser')}</span>
          </Button>
        )}
      </div>

      <AddUserDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        entityType={selectedEntityType}
        onSuccess={handleUserAdded}
      />
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('importUsers')}</DialogTitle>
            <DialogDescription>{t('importUsersDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center border-2 border-dashed rounded-md p-8">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">{t('dragAndDropFiles')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('orClickToSelectExcel')}</p>
                <div className="mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    {t('selectFile')}
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full">
                    {t('downloadTemplate')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleImport} disabled={loading.import}>
              {loading.import ? t('importing') : t('import')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserHeader;
