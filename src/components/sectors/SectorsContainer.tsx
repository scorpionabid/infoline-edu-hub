
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Trash2, RefreshCw, Download, UserPlus, MoreHorizontal } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sector, EnhancedSector } from '@/types/supabase'; // Import from supabase types directly
import { Region } from '@/types/supabase'; // Import from supabase types directly
import { useRegions } from '@/hooks/regions/useRegions';
import { useSectors } from '@/hooks/sectors/useSectors';
import { useSectorAdmins } from '@/hooks/sectors/useSectorAdmins';
import { toast } from 'sonner';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddSectorDialog from './AddSectorDialog';
import EditSectorDialog from './EditSectorDialog';
import DeleteSectorDialog from './DeleteSectorDialog';
import exportSectorsToExcel from '@/utils/exportSectorsToExcel';
import { supabase } from '@/integrations/supabase/client';

interface SectorsContainerProps {
  isLoading: boolean;
}

const SectorsContainer: React.FC<SectorsContainerProps> = ({ isLoading: externalIsLoading }) => {
  const { t } = useLanguageSafe();
  const user = useAuthStore(selectUser);
  const { userRole, regionId } = usePermissions();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const {
    regions,
    loading: regionsLoading,
    error: regionsError,
    fetchRegions
  } = useRegions();

  const {
    sectors,
    loading: sectorsLoading,
    error: sectorsError,
    fetchSectors,
  } = useSectors(regionFilter);

  const canManageSectors = () => {
    return userRole === 'superadmin' || userRole === 'regionadmin';
  };

  const canEditSector = (sector: Sector) => {
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && sector.region_id === regionId) return true;
    return false;
  };

  const canDeleteSector = (sector: Sector) => {
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && sector.region_id === regionId) return true;
    return false;
  };

  const handleCreateSector = async (sectorData: Omit<Sector, 'id'>) => {
    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('sectors')
        .insert(sectorData)
        .select()
        .single();
        
      if (error) throw error;
      
      fetchSectors();
      setIsAddDialogOpen(false);
      toast.success(t('sectorCreated'));
    } catch (error: any) {
      console.error("Sektor yaratma xətası:", error);
      toast.error(t('sectorCreationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSector = async (sectorData: Sector) => {
    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('sectors')
        .update(sectorData)
        .eq('id', sectorData.id)
        .select()
        .single();
        
      if (error) throw error;
      
      fetchSectors();
      setIsEditDialogOpen(false);
      toast.success(t('sectorUpdated'));
    } catch (error: any) {
      console.error("Sektor redaktə xətası:", error);
      toast.error(t('sectorUpdateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSector = async (sector: Sector) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sector.id);
        
      if (error) throw error;
      
      fetchSectors();
      setIsDeleteDialogOpen(false);
      toast.success(t('sectorDeleted'));
    } catch (error: any) {
      console.error("Sektor silmə xətası:", error);
      toast.error(t('sectorDeletionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Məktəb ID-lərini əldə edirik
  const sectorIds = useMemo(() => 
    Array.isArray(sectors) ? sectors.map(sector => sector.id) : [], 
    [sectors]
  );
  
  // Sektor adminlərini əldə edirik
  const { adminMap, isLoading: isAdminsLoading } = useSectorAdmins(sectorIds);

  const filterSectors = (
    sectors: Sector[],
    searchTerm: string,
    regionFilter: string,
    statusFilter: string
  ): EnhancedSector[] => {
    return sectors.map(sector => {
      const numberOfSchools = 5;
      const completionRate = 75;
      const regionName = regions?.find(r => r.id === sector.region_id)?.name || 'Unknown';
      const adminEmail = adminMap[sector.id] || 'Təyin edilməyib';
      
      const enhancedSector: EnhancedSector = {
        ...sector,
        school_count: numberOfSchools,
        completion_rate: completionRate,
        region_name: regionName,
        admin_email: adminEmail
      };
      return enhancedSector;
    }).filter(sector => {
      const searchMatch = searchTerm
        ? sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sector.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        : true;

      const regionMatch = regionFilter === '' || sector.region_id === regionFilter;
      const statusMatch = statusFilter === '' || sector.status === statusFilter;

      return searchMatch && regionMatch && statusMatch;
    });
  };

  const filteredSectors = filterSectors(sectors, searchTerm, regionFilter, statusFilter);

  const handleEditDialogOpen = (sector: Sector) => {
    setSelectedSector(sector);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (sector: Sector) => {
    setSelectedSector(sector);
    setIsDeleteDialogOpen(true);
  };

  const handleExportToExcel = () => {
    if (!sectors || sectors.length === 0) {
      toast.warning(t('noSectorsToExport') || 'İxrac etmək üçün sektor tapılmadı');
      return;
    }

    try {
      exportSectorsToExcel(sectors, {
        fileName: 'infoLine_sektorlar.xlsx',
        sheetName: t('sectors') || 'Sektorlar'
      });
      toast.success(t('exportSuccess') || 'Sektorlar uğurla ixrac edildi');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('exportError') || 'İxrac zamanı xəta baş verdi');
    }
  };

  // Yalnız komponent qurulduğunda və asılı olan məlumatlar dəyişdikdə verilənləri yükləyirik
  // fetchSectors və fetchRegions asılılıq massivindən çıxarılıb
  // bu, sonsuz dövrəni aradan qaldırır
  useEffect(() => {
    // Yükləmə bayraqı - qaçılmaz yükləmələrin qarşısını almaq üçün
    let isActive = true;
    
    const loadData = async () => {
      try {
        // Regionları çağırırıq
        fetchRegions();
        
        // Sektorları çağırırıq
        if (user && userRole === 'regionadmin' && regionId && isActive) {
          fetchSectors(regionId);
        } else if (isActive) {
          fetchSectors();
        }
      } catch (error) {
        console.error('Data loading error:', error);
      }
    };
    
    loadData();
    
    // Təmizləmə funksiya - komponent sönürsə
    return () => {
      isActive = false;
    };
  }, [regionId, user, userRole]);
  
  // Filter dəyişdikdə sektorları təkrar yükləyirik
  // Lakin, bunu 300ms gecikmə ilə edirik ki, hər dəyişiklikdə yükləmə olmamasın
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user && userRole === 'regionadmin' && regionId) {
        fetchSectors(regionId);
      } else {
        fetchSectors();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [regionFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            disabled={sectorsLoading || !canManageSectors()}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('addSector')}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportToExcel}
            disabled={sectorsLoading || !sectors || sectors.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchSectors()}
            disabled={sectorsLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('refresh')}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            type="text"
            placeholder={t('searchSectors')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select 
            value={regionFilter || 'ALL'} 
            onValueChange={(value) => setRegionFilter(value === 'ALL' ? '' : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filterByRegion')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('allRegions')}</SelectItem>
              {regions?.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={statusFilter || 'ALL'} 
            onValueChange={(value) => setStatusFilter(value === 'ALL' ? '' : value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea>
        <Table>
          <TableCaption>{t('sectorsList')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">{t('sectorName')}</TableHead>
              <TableHead className="w-[25%]">{t('admin')}</TableHead>
              <TableHead className="w-[25%]">{t('description')}</TableHead>
              <TableHead className="w-[10%]">{t('status')}</TableHead>
              <TableHead className="text-right w-[15%]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSectors.map(sector => (
              <TableRow key={sector.id}>
                <TableCell className="font-medium">{sector.name}</TableCell>
                <TableCell>
                  {isAdminsLoading ? (
                    <span className="flex items-center">
                      <span className="h-3 w-3 mr-2 animate-spin rounded-full border-b-2 border-gray-500"></span>
                      {t('loading')}
                    </span>
                  ) : (
                    sector.admin_email || '-'
                  )}
                </TableCell>
                <TableCell>{sector.description}</TableCell>
                <TableCell>
                  {sector.status === 'active' 
                    ? <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{t('active')}</span>
                    : <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">{t('inactive')}</span>
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-1">
                    {/* Əsas əməliyyat düymələri birbaşa göstərilir */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => handleEditDialogOpen(sector)}
                      disabled={!canEditSector(sector)}
                      title={t('edit')}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      title={t('assignAdmin')}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </Button>
                    
                    {/* Əlavə əməliyyatlar üçün dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <span className="sr-only">{t('openMenu')}</span>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">{t('moreActions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteDialogOpen(sector)} 
                          disabled={!canDeleteSector(sector)}
                          className="text-xs text-red-600"
                        >
                          <Trash2 className="mr-2 h-3 w-3" /> {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {isAddDialogOpen && (
        <AddSectorDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          regions={regions}
          onSubmit={handleCreateSector}
          isSubmitting={isSubmitting}
        />
      )}

      {isEditDialogOpen && selectedSector && (
        <EditSectorDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          sector={selectedSector}
          regions={regions}
          onSubmit={handleEditSector}
          isSubmitting={isSubmitting}
        />
      )}

      {isDeleteDialogOpen && selectedSector && (
        <DeleteSectorDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          sector={selectedSector}
          onConfirm={() => handleDeleteSector(selectedSector)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default SectorsContainer;
