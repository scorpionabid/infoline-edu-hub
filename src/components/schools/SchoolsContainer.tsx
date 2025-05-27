import React from 'react';
import { School, adaptSchoolFromSupabase } from '@/types/school'; 
import { Region } from '@/types/supabase'; // Import from supabase types
import { Sector } from '@/types/supabase'; // Import from supabase types
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
import { Plus, Edit, Trash2, Download, RefreshCw, UserPlus, Link, FolderOpen } from 'lucide-react';
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
import SchoolLinksDialog from './school-links/SchoolLinksDialog';
import { SchoolFilesDialog } from './school-files/SchoolFilesDialog';
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
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = React.useState(false);
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [regionFilter, setRegionFilter] = React.useState('all');
  const [sectorFilter, setSectorFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  function canManageSchools() {
    return userRole === 'superadmin' || userRole === 'regionadmin' || userRole === 'sectoradmin';
  }

  function canEditSchool(school: School) {
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && school.region_id === regionId) return true;
    return false;
  }

  function canDeleteSchool(school: School) {
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && school.region_id === regionId) return true;
    return false;
  }

  function canAssignAdmin(school: School) {
    if (userRole === 'superadmin') return true;
    if (userRole === 'regionadmin' && school.region_id === regionId) return true;
    return false;
  }

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header controls - responsive layout */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0 gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            disabled={isLoading || !canManageSchools()}
            className="text-xs sm:text-sm"
          >
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('addSchool')}</span>
            <span className="sm:hidden">{t('add')}</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportToExcel}
            disabled={isLoading || schoolsArray.length === 0}
            className="text-xs sm:text-sm"
          >
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('export')}</span>
            <span className="sm:hidden">{t('export')}</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs sm:text-sm"
          >
            <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('refresh')}</span>
            <span className="sm:hidden">{t('refresh')}</span>
          </Button>
        </div>
        
        {/* Filters - responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:flex sm:flex-wrap lg:gap-2">
          <Input
            type="text"
            placeholder={t('searchSchools')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="text-sm"
          />
          <Select value={regionFilter || 'all'} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full sm:w-[140px] lg:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[140px] lg:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[120px] lg:w-[150px]">
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
      
      {/* Table - with horizontal scroll on mobile */}
      <div className="rounded-md border">
        <ScrollArea className="w-full">
          <Table>
            <TableCaption className="text-xs sm:text-sm">{t('schoolsList')}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">{t('schoolName')}</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('region')}</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('sector')}</TableHead>
                <TableHead className="text-xs sm:text-sm">{t('status')}</TableHead>
                <TableHead className="text-xs sm:text-sm text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map(school => (
                <TableRow key={school.id} className={school.status === 'active' ? '' : 'opacity-60'}>
                  <TableCell className="text-xs sm:text-sm font-medium">
                    <div>
                      <div>{school.name}</div>
                      {/* Show region/sector on mobile under school name */}
                      <div className="text-xs text-muted-foreground sm:hidden">
                        {regionNames[school.region_id]} • {sectorNames[school.sector_id]}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{regionNames[school.region_id] || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{sectorNames[school.sector_id] || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    {school.status === 'active' 
                      ? <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-green-100 text-green-800 text-xs">Aktiv</span>
                      : <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-red-100 text-red-800 text-xs">Deaktiv</span>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                          <span className="sr-only">{t('openMenu')}</span>
                          <span className="text-sm">···</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">{t('actions')}</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedSchool(school);
                            setIsLinkDialogOpen(true);
                          }}
                          className="text-xs"
                        >
                          <Link className="mr-2 h-3 w-3" /> Linklər
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedSchool(school);
                            setIsFileDialogOpen(true);
                          }}
                          className="text-xs"
                        >
                          <FolderOpen className="mr-2 h-3 w-3" /> Fayllar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleEditDialogOpen(school)} 
                          disabled={!canEditSchool(school)}
                          className="text-xs"
                        >
                          <Edit className="mr-2 h-3 w-3" /> {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleAdminDialogOpen(school)} 
                          disabled={!canAssignAdmin(school)}
                          className="text-xs"
                        >
                          <UserPlus className="mr-2 h-3 w-3" /> {t('assignAdmin')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteDialogOpen(school)} 
                          disabled={!canDeleteSchool(school)}
                          className="text-xs text-red-600"
                        >
                          <Trash2 className="mr-2 h-3 w-3" /> {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      
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
      
      {/* Link Management Dialog */}
      {isLinkDialogOpen && selectedSchool && (
        <SchoolLinksDialog
          isOpen={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
          school={selectedSchool}
          links={[]}
          onDelete={async (linkId) => { console.log('Deleting link', linkId); }}
          onCreate={async (linkData) => { console.log('Creating link', linkData); }}
          onUpdate={async (linkData) => { console.log('Updating link', linkData); }}
          fetchLinks={async () => { console.log('Fetching links'); }}
        />
      )}
      
      {/* File Management Dialog */}
      {isFileDialogOpen && selectedSchool && (
        <SchoolFilesDialog
          isOpen={isFileDialogOpen}
          onClose={() => setIsFileDialogOpen(false)}
          school={selectedSchool}
          userRole={user?.role || 'viewer'}
        />
      )}
    </div>
  );
};

export default SchoolsContainer;
