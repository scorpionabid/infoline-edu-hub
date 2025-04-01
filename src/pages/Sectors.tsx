
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, FileSpreadsheet, Plus, Search, Trash2, Pencil } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSectorsStore } from '@/hooks/useSectorsStore';
import SectorActionDialog from '@/components/sectors/SectorActionDialog';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Sectors: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Zustand store
  const { 
    sectors, 
    filteredSectors, 
    loading, 
    error,
    searchTerm,
    selectedStatus,
    currentPage,
    pageSize,
    totalPages,
    isOperationComplete,
    fetchSectors, 
    handleSearch,
    handleStatusFilter,
    handleSort,
    handleAddSector,
    handleUpdateSector,
    handleDeleteSector,
    resetFilters,
    handlePageChange,
    setIsOperationComplete
  } = useSectorsStore();

  // Lokal state'lər
  const [sectorFormData, setSectorFormData] = useState({
    name: '',
    description: '',
    region_id: user?.regionId || '',
    status: 'active' as 'active' | 'inactive'
  });
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: 'Password123'
  });
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSector, setSelectedSector] = useState<any>(null);
  const [adminGenerationMode, setAdminGenerationMode] = useState<'auto' | 'manual'>('auto');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  
  // Səhifələmə üçün state'lər
  const paginatedSectors = filteredSectors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Component ilk dəfə açıldığında sektorları yüklə
  useEffect(() => {
    const loadSectors = async () => {
      try {
        // Region admini üçün, öz regionundan olan sektorları göstər
        if (user?.role === 'regionadmin' && user?.regionId) {
          await fetchSectors(user.regionId);
        } else {
          // SuperAdmin üçün bütün sektorları göstər
          await fetchSectors();
        }
      } catch (err) {
        console.error("Sektorların yüklənməsində xəta:", err);
      }
    };
    
    loadSectors();
    
    // Digər komponentlərdən gələn state-i təmizlə
    return () => {
      resetFilters();
    };
  }, [user?.regionId, user?.role, fetchSectors, resetFilters]);

  // Əməliyyat status dəyişikliyi
  useEffect(() => {
    if (isOperationComplete) {
      closeDialogs();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, setIsOperationComplete]);

  // Bütün dialogları bağla
  const closeDialogs = () => {
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
    setSelectedSector(null);
  };

  // Sektor yaratma dialogunu aç
  const openCreateDialog = () => {
    setSectorFormData({
      name: '',
      description: '',
      region_id: user?.regionId || '',
      status: 'active'
    });
    setAdminFormData({
      name: '',
      email: '',
      password: 'Password123'
    });
    setShowCreateDialog(true);
  };

  // Sektor redaktə dialogunu aç
  const openEditDialog = (sector: any) => {
    setSelectedSector(sector);
    setSectorFormData({
      name: sector.name || '',
      description: sector.description || '',
      region_id: sector.region_id || user?.regionId || '',
      status: sector.status as 'active' | 'inactive'
    });
    setShowEditDialog(true);
  };

  // Sektor silmə dialogunu aç
  const openDeleteDialog = (sector: any) => {
    setSelectedSector(sector);
    setShowDeleteDialog(true);
  };

  // Axtarış ve statusla filtrelemə
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  const handleStatusChange = (value: string | null) => {
    handleStatusFilter(value);
  };

  // Formdan məlumatları yığ
  const handleSectorFormChange = (field: string, value: string) => {
    setSectorFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Avtomatik admin məlumatlarını yarat
    if (field === 'name' && adminGenerationMode === 'auto') {
      const transliterateName = (text: string): string => {
        const letters: Record<string, string> = {
          'ə': 'e', 'ü': 'u', 'ö': 'o', 'ğ': 'g', 'ı': 'i',
          'ş': 'sh', 'ç': 'ch', 'Ə': 'E', 'Ü': 'U', 'Ö': 'O',
          'Ğ': 'G', 'I': 'I', 'Ş': 'Sh', 'Ç': 'Ch'
        };
        
        return text
          .replace(/[əüöğışçƏÜÖĞIŞÇ]/g, match => letters[match] || match)
          .toLowerCase()
          .replace(/\s+/g, '.')
          .replace(/[^\w\s.]/gi, '');
      };
      
      const adminName = `${value} Admin`;
      const processedName = transliterateName(value);
      const adminEmail = `${processedName}.admin@infoline.edu`;
      
      setAdminFormData(prev => ({
        ...prev,
        name: adminName,
        email: adminEmail
      }));
    }
  };

  // Admin məlumatlarını manuel dəyişmək
  const handleAdminFormChange = (field: string, value: string) => {
    // Manual dəyişiklik olduqda, avtomatik generasiyanı söndür
    setAdminGenerationMode('manual');
    
    setAdminFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Admin generasiya rejimini dəyişmək
  const toggleAdminGenerationMode = () => {
    if (adminGenerationMode === 'manual') {
      setAdminGenerationMode('auto');
      // Auto rejimə keçid üçün admin məlumatlarını yenidən generasiya et
      handleSectorFormChange('name', sectorFormData.name);
    } else {
      setAdminGenerationMode('manual');
    }
  };

  // Sektor əlavə et
  const handleAddSubmit = async () => {
    const sectorDataToAdd = {
      name: sectorFormData.name,
      description: sectorFormData.description,
      region_id: sectorFormData.region_id || user?.regionId,
      status: sectorFormData.status as 'active' | 'inactive',
      adminEmail: adminFormData.email,
      adminName: adminFormData.name,
      adminPassword: adminFormData.password
    };
    
    await handleAddSector(sectorDataToAdd);
  };

  // Sektor redaktə et
  const handleUpdateSubmit = async () => {
    if (!selectedSector) return;
    
    await handleUpdateSector(selectedSector.id, sectorFormData);
  };

  // Sektor sil
  const handleDeleteSubmit = async () => {
    if (!selectedSector) return;
    
    await handleDeleteSector(selectedSector.id);
  };

  // Cədvəldə sütunları sırala
  const handleColumnSort = (key: string) => {
    handleSort(key);
  };

  // Excel export
  const handleExport = () => {
    toast.info(t('exportStarted'), {
      description: t('preparingExport')
    });
    
    // Əslində burada Excel export kodu olacaq
    setTimeout(() => {
      toast.success(t('exportComplete'), {
        description: t('exportSuccess')
      });
    }, 1500);
  };

  // Import
  const handleImport = () => {
    toast.info(t('featureInDevelopment'), {
      description: t('comingSoon')
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h1 className="text-2xl font-bold text-red-500">{t('errorOccurred')}</h1>
        <p>{error.message}</p>
        <Button onClick={() => fetchSectors()}>
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('sectors')}</h1>
          <p className="text-muted-foreground">{t('sectorsDescription')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t('import')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
          <Button
            size="sm"
            onClick={openCreateDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('createSector')}
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder={t('searchSectors')}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Select
            value={selectedStatus || 'all'}
            onValueChange={(value) => handleStatusFilter(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
                  onClick={() => handleColumnSort('name')}
                >
                  {t('name')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
                  onClick={() => handleColumnSort('regionName')}
                >
                  {t('regionName')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
                  onClick={() => handleColumnSort('adminEmail')}
                >
                  {t('sectorAdmin')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
                  onClick={() => handleColumnSort('schoolCount')}
                >
                  {t('schoolCount')}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted transition-colors px-4 py-2"
                  onClick={() => handleColumnSort('completionRate')}
                >
                  {t('completionRate')}
                </TableHead>
                <TableHead className="text-center">{t('status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(null).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedSectors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    {searchTerm || selectedStatus ? 
                      t('noSectorsMatchingFilters') :
                      t('noSectorsYet')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSectors.map((sector, index) => (
                  <TableRow 
                    key={sector.id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell>{sector.name}</TableCell>
                    <TableCell>{sector.regionName}</TableCell>
                    <TableCell>{sector.adminEmail || t('noAdmin')}</TableCell>
                    <TableCell className="text-center">{sector.schoolCount || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (sector.completionRate || 0) > 80 
                                ? 'bg-green-500' 
                                : (sector.completionRate || 0) > 30 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${sector.completionRate || 0}%` }}
                          />
                        </div>
                        <span className="text-xs">{sector.completionRate || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={sector.status === 'active' ? 'success' : 'destructive'}
                      >
                        {sector.status === 'active' ? t('active') : t('inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(sector)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">{t('edit')}</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(sector)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t('delete')}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredSectors.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              {t('showingResults', {
                start: (currentPage - 1) * pageSize + 1,
                end: Math.min(currentPage * pageSize, filteredSectors.length),
                total: filteredSectors.length
              })}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {t('previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Create, edit və delete modal */}
      <SectorActionDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        action="create"
        regionId={user?.regionId}
        onSuccess={() => {
          closeDialogs();
        }}
      />
      
      <SectorActionDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        action="edit"
        sector={selectedSector}
        onSuccess={() => {
          closeDialogs();
        }}
      />
      
      <SectorActionDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        action="delete"
        sector={selectedSector}
        onSuccess={() => {
          closeDialogs();
        }}
      />
    </div>
  );
};

export default Sectors;
