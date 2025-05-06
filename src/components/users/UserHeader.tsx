import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { UserPlus, Upload, Download, Filter, X } from 'lucide-react';
import { H1 } from '@/components/ui/typography';
import AddUserDialog from './AddUserDialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
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
import { Badge } from '@/components/ui/badge';
import { UserFilter } from '@/hooks/useUserList';
import { useUserList } from '@/hooks/useUserList';

interface UserHeaderProps {
  onUserAddedOrEdited: () => void;
  entityTypes: Array<'region' | 'sector' | 'school'>;
  filterParams?: {
    sectorId?: string;
    regionId?: string;
  };
}

const UserHeader: React.FC<UserHeaderProps> = ({ 
  onUserAddedOrEdited,
  entityTypes,
  filterParams
}) => {
  const { t } = useLanguage();
  const { filter, updateFilter, resetFilter } = useUserList();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Filter parametrlərini izləyək
  useEffect(() => {
    if (filterParams) {
      updateFilter(filterParams);
    }
  }, [filterParams, updateFilter]);

  // Aktiv filterləri izləyək
  useEffect(() => {
    const newActiveFilters: string[] = [];
    
    if (filter.role) newActiveFilters.push(`${t('role')}: ${t(filter.role)}`);
    if (filter.status) newActiveFilters.push(`${t('status')}: ${t(filter.status)}`);
    if (filter.regionId) newActiveFilters.push(`${t('region')}: ${filter.regionId}`);
    if (filter.sectorId) newActiveFilters.push(`${t('sector')}: ${filter.sectorId}`);
    if (filter.schoolId) newActiveFilters.push(`${t('school')}: ${filter.schoolId}`);
    if (filter.search) newActiveFilters.push(`${t('search')}: ${filter.search}`);
    
    setActiveFilters(newActiveFilters);
  }, [filter, t]);

  // İstifadəçi əlavə etmə dialoqu
  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  // İstifadəçi əlavə edildikdən sonra
  const handleUserAdded = () => {
    setIsAddDialogOpen(false);
    onUserAddedOrEdited();
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
      onUserAddedOrEdited();
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

  // Axtarış funksiyası
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateFilter({ ...filter, search: value });
  };

  // Axtarışı təmizlə
  const clearSearch = () => {
    setSearchQuery('');
    updateFilter({ ...filter, search: '' });
  };

  // Filter funksiyaları
  const handleFilterChange = (key: keyof UserFilter, value: string) => {
    if (key === "role") {
      updateFilter({ ...filter, role: value });
    } else if (key === "regionId") {
      updateFilter({ ...filter, regionId: value });
    } else if (key === "sectorId") {
      updateFilter({ ...filter, sectorId: value });
    } else if (key === "schoolId") {
      updateFilter({ ...filter, schoolId: value });
    } else if (key === "status") {
      updateFilter({ ...filter, status: value });
    }
  };

  // Bütün filterləri sıfırla
  const handleResetFilters = () => {
    resetFilter();
    setSearchQuery('');
  };

  // Bir filteri sil
  const handleRemoveFilter = (filterText: string) => {
    // Filteri analiz et və müvafiq filteri sil
    if (filterText.startsWith(`${t('role')}`)) {
      updateFilter({ ...filter, role: undefined });
    } else if (filterText.startsWith(`${t('status')}`)) {
      updateFilter({ ...filter, status: undefined });
    } else if (filterText.startsWith(`${t('region')}`)) {
      updateFilter({ ...filter, regionId: undefined });
    } else if (filterText.startsWith(`${t('sector')}`)) {
      updateFilter({ ...filter, sectorId: undefined });
    } else if (filterText.startsWith(`${t('school')}`)) {
      updateFilter({ ...filter, schoolId: undefined });
    } else if (filterText.startsWith(`${t('search')}`)) {
      updateFilter({ ...filter, search: undefined });
      setSearchQuery('');
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <H1>{t('users')}</H1>
        
        <div className="flex space-x-2">
          {/* Axtarış */}
          <div className="relative">
            <Input
              placeholder={t('searchUsers')}
              value={searchQuery}
              onChange={handleSearch}
              className="w-[250px] pl-8 pr-8"
            />
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                {t('filters')}
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleResetFilters} disabled={!filter || Object.keys(filter).length === 0}>
                {t('clearAllFilters')}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <div className="px-2 py-1.5 text-sm font-semibold">{t('status')}</div>
              <DropdownMenuCheckboxItem 
                checked={filter.status === 'active'}
                onCheckedChange={() => handleFilterChange('status', 'active')}
              >
                {t('active')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={filter.status === 'inactive'}
                onCheckedChange={() => handleFilterChange('status', 'inactive')}
              >
                {t('inactive')}
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              
              <div className="px-2 py-1.5 text-sm font-semibold">{t('role')}</div>
              <DropdownMenuCheckboxItem 
                checked={filter.role === 'superadmin'}
                onCheckedChange={() => handleFilterChange('role', 'superadmin')}
              >
                {t('superadmin')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={filter.role === 'regionadmin'}
                onCheckedChange={() => handleFilterChange('role', 'regionadmin')}
              >
                {t('regionadmin')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={filter.role === 'sectoradmin'}
                onCheckedChange={() => handleFilterChange('role', 'sectoradmin')}
              >
                {t('sectoradmin')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={filter.role === 'schooladmin'}
                onCheckedChange={() => handleFilterChange('role', 'schooladmin')}
              >
                {t('schooladmin')}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
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
          
          {/* İmport */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenImportDialog}
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            {t('import')}
          </Button>
          
          {/* İstifadəçi əlavə et */}
          <Button 
            onClick={handleOpenAddDialog}
            className="flex items-center gap-1"
          >
            <UserPlus className="h-4 w-4" />
            {t('addUser')}
          </Button>
        </div>
      </div>
      
      {/* Aktiv filterlər */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filterText, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2 py-1">
              {filterText}
              <button 
                onClick={() => handleRemoveFilter(filterText)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {activeFilters.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFilters} 
              className="h-6 text-xs"
            >
              {t('clearAll')}
            </Button>
          )}
        </div>
      )}

      {/* İstifadəçi əlavə etmə dialoqu */}
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onComplete={handleUserAdded}
        entityTypes={entityTypes}
      />

      {/* İmport dialoqu */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleImport} disabled={!importFile || isImporting}>
              {isImporting ? t('importing') : t('import')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserHeader;
