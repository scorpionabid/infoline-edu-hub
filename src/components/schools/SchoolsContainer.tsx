import React from 'react';
import { School } from '@/types/school'; // School tipini school.ts-dən götürək
import { Region } from '@/types/school';
import { Sector } from '@/types/school';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Download, RefreshCw, UserPlus } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useAuth } from '@/context/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AddSchoolDialog from './AddSchoolDialog';
import EditSchoolDialog from './EditSchoolDialog';
import DeleteSchoolDialog from './DeleteSchoolDialog';
import SchoolAdminDialog from './SchoolAdminDialog';
import exportSchoolsToExcel from '@/utils/exportSchoolsToExcel';
import { supabase } from '@/integrations/supabase/client';

interface SchoolsContainerProps {
  schools: School[];
  regions: Region[];
  sectors: Sector[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreate: (school: Omit<School, 'id'>) => Promise<void>;
  onEdit: (school: School) => Promise<void>;
  onDelete: (school: School) => Promise<void>;
  onAssignAdmin: (schoolId: string, userId: string) => Promise<void>;
  regionNames: { [key: string]: string };
  sectorNames: { [key: string]: string };
}

// SchoolsContainer komponenti
const SchoolsContainer: React.FC<SchoolsContainerProps> = ({
  schools,
  regions,
  sectors,
  isLoading,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
  onAssignAdmin,
  regionNames,
  sectorNames
}) => {
  const { t } = useLanguageSafe();
  const { userRole, regionId } = usePermissions();
  const { user } = useAuth();

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = React.useState(false);
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState('all');
  const [sectorFilter, setSectorFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const canManageSchools = () => {
    return userRole === 'superadmin' || userRole === 'regionadmin' || userRole === 'sectoradmin';
  };

  const canEditSchool = (school: School) => {
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && school.region_id === regionId) return true;
    return false;
  };

  const canDeleteSchool = (school: School) => {
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && school.region_id === regionId) return true;
    return false;
  };

  const canAssignAdmin = (school: School) => {
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && school.region_id === regionId) return true;
    return false;
  };

  const handleCreateSchool = async (schoolData: Omit<School, 'id'>) => {
    try {
      setIsSubmitting(true);
      await onCreate(schoolData);
      setIsAddDialogOpen(false);
      toast.success(t('schoolCreated'));
    } catch (error) {
      console.error("Məktəb yaratma xətası:", error);
      toast.error(t('schoolCreationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSchool = async (schoolData: School) => {
    try {
      setIsSubmitting(true);
      await onEdit(schoolData);
      setIsEditDialogOpen(false);
      toast.success(t('schoolUpdated'));
    } catch (error) {
      console.error("Məktəb redaktə xətası:", error);
      toast.error(t('schoolUpdateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchool = async (school: School) => {
    try {
      setIsSubmitting(true);
      if (school) {
        await onDelete(school);
        setIsDeleteDialogOpen(false);
        toast.success(t('schoolDeleted'));
      } else {
        toast.error(t('schoolNotFound'));
      }
    } catch (error) {
      console.error("Məktəb silmə xətası:", error);
      toast.error(t('schoolDeletionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignAdmin = async (schoolId: string, userId: string) => {
    try {
      setIsSubmitting(true);
      await onAssignAdmin(schoolId, userId);
      setIsAdminDialogOpen(false);
      toast.success(t('adminAssigned'));
    } catch (error) {
      console.error("Admin təyin etmə xətası:", error);
      toast.error(t('adminAssignmentFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filterSchools = (
    schools: School[],
    searchTerm: string,
    regionFilter: string,
    sectorFilter: string,
    statusFilter: string
  ): School[] => {
    if (!schools || !Array.isArray(schools)) {
      console.error("filterSchools: schools is not an array", schools);
      return [];
    }
    
    return schools.filter(school => {
      const searchMatch = searchTerm
        ? school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.principal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        : true;

      const regionMatch = regionFilter === 'all' || school.region_id === regionFilter;
      const sectorMatch = sectorFilter === 'all' || school.sector_id === sectorFilter;
      const statusMatch = statusFilter === 'all' || school.status === statusFilter;

      return searchMatch && regionMatch && sectorMatch && statusMatch;
    });
  };

  // Dialog handlers  
  const handleEditDialogOpen = (school: School) => {
    setSelectedSchool(school);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  };

  const handleAdminDialogOpen = (school: School) => {
    setSelectedSchool(school);
    setIsAdminDialogOpen(true);
  };
  
  // Export to Excel
  const handleExportToExcel = () => {
    if (!schools || schools.length === 0) {
      toast.warning(t('noSchoolsToExport') || 'İxrac etmək üçün məktəb tapılmadı');
      return;
    }

    try {
      const filteredSchools = filterSchools(schools, searchTerm, regionFilter, sectorFilter, statusFilter);
      exportSchoolsToExcel(filteredSchools, {
        fileName: 'infoLine_məktəblər.xlsx',
        sheetName: t('schools') || 'Məktəblər'
      });
      
      toast.success(t('exportSuccess') || 'Məktəblər uğurla ixrac edildi');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('exportError') || 'İxrac zamanı xəta baş verdi');
    }
  };
  
  // Ensure regions and sectors are arrays to prevent length issues
  const regionsArray = Array.isArray(regions) ? regions : [];
  const sectorsArray = Array.isArray(sectors) ? sectors : [];
  const schoolsArray = Array.isArray(schools) ? schools : [];
  
  const filteredSchools = filterSchools(schoolsArray, searchTerm, regionFilter, sectorFilter, statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            disabled={isLoading || !canManageSchools()}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('addSchool')}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportToExcel}
            disabled={isLoading || schoolsArray.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('export')}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('refresh')}
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Input
            type="text"
            placeholder={t('searchSchools')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select value={regionFilter || 'all'} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filterByRegion')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allRegions')}</SelectItem>
              {regionsArray.map(region => (
                <SelectItem key={region.id} value={region.id || `region-${Math.random().toString(36).substr(2, 9)}`}>
                  {regionNames[region.id] || region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sectorFilter || 'all'} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filterBySector')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allSectors')}</SelectItem>
              {sectorsArray.map(sector => (
                <SelectItem key={sector.id} value={sector.id || `sector-${Math.random().toString(36).substr(2, 9)}`}>
                  {sectorNames[sector.id] || sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter || 'all'} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="blocked">{t('blocked')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <ScrollArea>
        <Table>
          <TableCaption>{t('schoolsList')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{t('schoolName')}</TableHead>
              <TableHead>{t('region')}</TableHead>
              <TableHead>{t('sector')}</TableHead>
              <TableHead>{t('principal')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchools.map(school => (
              <TableRow key={school.id}>
                <TableCell>{school.name}</TableCell>
                <TableCell>{regionNames[school.region_id] || ''}</TableCell>
                <TableCell>{sectorNames[school.sector_id] || ''}</TableCell>
                <TableCell>{school.principalName || school.principal_name || '-'}</TableCell>
                <TableCell>{school.status}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        ...
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditDialogOpen(school)} disabled={!canEditSchool(school)}>
                        <Edit className="mr-2 h-4 w-4" /> {t('edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAdminDialogOpen(school)} disabled={!canAssignAdmin(school)}>
                        <UserPlus className="mr-2 h-4 w-4" /> {t('assignAdmin')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteDialogOpen(school)} disabled={!canDeleteSchool(school)}>
                        <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      
      {/* Dialogs */}
      {isAddDialogOpen && (
        <AddSchoolDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          regions={regionsArray}
          sectors={sectorsArray}
          onSubmit={handleCreateSchool}
          regionNames={regionNames}
          sectorNames={sectorNames}
          isSubmitting={isSubmitting}
        />
      )}
      
      {isEditDialogOpen && selectedSchool && (
        <EditSchoolDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          school={selectedSchool}
          regions={regionsArray}
          sectors={sectorsArray}
          onSubmit={handleEditSchool}
          regionNames={regionNames}
          sectorNames={sectorNames}
          isSubmitting={isSubmitting}
        />
      )}
      
      {isDeleteDialogOpen && selectedSchool && (
        <DeleteSchoolDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          school={selectedSchool}
          onConfirm={() => handleDeleteSchool(selectedSchool)}
          isSubmitting={isSubmitting}
        />
      )}
      
      {isAdminDialogOpen && selectedSchool && (
        <SchoolAdminDialog
          isOpen={isAdminDialogOpen}
          onClose={() => setIsAdminDialogOpen(false)}
          school={selectedSchool}
          onSubmit={handleAssignAdmin}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default SchoolsContainer;
