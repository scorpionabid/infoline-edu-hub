
import React, { useEffect, useMemo, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import SchoolFilters from './SchoolFilters';
import SchoolTable from './SchoolTable';
import SchoolPagination from './SchoolPagination';
import SchoolHeader from './SchoolHeader';
import { useSchoolsStore, SortConfig } from '@/hooks/schools/useSchoolsStore';
import { useSchoolDialogHandlers } from '@/hooks/schools/useSchoolDialogHandlers';
import SchoolDialogs from './SchoolDialogs';
import { toast } from 'sonner';
import ImportDialog from './ImportDialog';
import { useImportExport } from '@/hooks/schools/useImportExport';
import { UserRole } from '@/types/supabase';
import { School, adaptSchoolFromSupabase, adaptSchoolToSupabase } from '@/types/school';
import { Button } from '@/components/ui/button';
import { exportSchoolsToExcel } from '@/utils/exportSchoolsToExcel';
import { Plus, Upload, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

const syncSchoolAdmins = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-school-admins');
    
    if (error) {
      console.error('Məktəb adminlərini sinxronlaşdırarkən xəta:', error);
      throw error;
    }
    
    console.log('Məktəb adminləri sinxronlaşdırıldı:', data);
    
    if (data && data.fixed > 0) {
      toast.success('Admin məlumatları sinxronlaşdırıldı', {
        description: `${data.fixed} məktəbdə admin məlumatları düzəldildi`
      });
    } else {
      toast.info('Bütün admin məlumatları aktual', {
        description: 'Sinxronlaşdırmaya ehtiyac yoxdur'
      });
    }
    
    document.dispatchEvent(new Event('refresh-schools'));
    
  } catch (error) {
    console.error('Məktəb adminlərini sinxronlaşdırarkən xəta:', error);
    toast.error('Sinxronlaşdırma xətası', {
      description: 'Admin məlumatları sinxronlaşdırılarkən xəta baş verdi'
    });
  }
};

const SchoolsContainer: React.FC = () => {
  const { t } = useLanguage();
  
  const {
    currentItems: supabaseCurrentItems,
    searchTerm,
    selectedRegion,
    selectedSector,
    selectedStatus,
    sectors,
    regions,
    sortConfig,
    currentPage,
    totalPages,
    handleSearch: originalHandleSearch,
    handleRegionFilter: originalHandleRegionFilter,
    handleSectorFilter: originalHandleSectorFilter,
    handleStatusFilter: originalHandleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    fetchSchools,
    isOperationComplete,
    setIsOperationComplete,
    schools: supabaseSchools,
    userRole
  } = useSchoolsStore();

  const schools = useMemo(() => supabaseSchools.map(adaptSchoolFromSupabase), [supabaseSchools]);
  const currentItems = useMemo(() => supabaseCurrentItems.map(adaptSchoolFromSupabase), [supabaseCurrentItems]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => originalHandleSearch(e);
  const handleRegionFilter = (e: ChangeEvent<HTMLSelectElement>) => originalHandleRegionFilter(e);
  const handleSectorFilter = (e: ChangeEvent<HTMLSelectElement>) => originalHandleSectorFilter(e);
  const handleStatusFilter = (e: ChangeEvent<HTMLSelectElement>) => originalHandleStatusFilter(e);

  const {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isAdminDialogOpen,
    selectedSchool,
    selectedAdmin,
    closeDeleteDialog,
    closeEditDialog,
    closeAddDialog,
    closeAdminDialog,
    handleAddDialogOpen,
    handleEditDialogOpen: handleEditDialogOpenOriginal,
    handleDeleteDialogOpen: handleDeleteDialogOpenOriginal,
    handleAdminDialogOpen: handleAdminDialogOpenOriginal,
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteConfirm,
    handleAdminUpdate,
    handleResetPassword,
    formData,
    currentTab,
    setCurrentTab,
    handleFormChange
  } = useSchoolDialogHandlers();

  const handleEditDialogOpen = (school: School) => {
    handleEditDialogOpenOriginal(adaptSchoolToSupabase(school) as any);
  };

  const handleDeleteDialogOpen = (school: School) => {
    handleDeleteDialogOpenOriginal(adaptSchoolToSupabase(school) as any);
  };

  const handleAdminDialogOpen = (school: School) => {
    handleAdminDialogOpenOriginal(adaptSchoolToSupabase(school) as any);
  };

  const {
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleExportToExcel,
    handleImportSchools
  } = useImportExport(() => setIsOperationComplete(true));

  useEffect(() => {
    if (isOperationComplete) {
      fetchSchools();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, fetchSchools, setIsOperationComplete]);

  const filteredSectors = useMemo(() => {
    let sectorsList = sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      regionId: sector.region_id
    }));
    
    const validRoles: UserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
    const userRoleTyped: UserRole | null = userRole && validRoles.includes(userRole as UserRole) 
      ? (userRole as UserRole) 
      : null;
    
    if (userRoleTyped === 'sectoradmin') {
      sectorsList = sectorsList.filter(sector => sector.id === selectedSector);
    }
    else if (userRoleTyped === 'regionadmin' && selectedRegion) {
      sectorsList = sectorsList.filter(sector => sector.regionId === selectedRegion);
    }
    
    return sectorsList;
  }, [sectors, userRole, selectedSector, selectedRegion]);

  const handleExportClick = () => {
    handleExportToExcel(supabaseSchools);
  };

  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  const safeUserRole = useMemo(() => {
    const validRoles = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'] as const;
    const currentRole = userRole as string;
    return validRoles.includes(currentRole as any) ? 
           (currentRole as "superadmin" | "regionadmin" | "sectoradmin" | "schooladmin") : 
           'schooladmin' as const;
  }, [userRole]);

  const schoolsWithAdminIssues = useMemo(() => {
    return schools.filter(school => school.admin_email && !school.admin_id).length;
  }, [schools]);

  // Region və sektor adlarını ID-lərə görə hazırlayırıq
  const regionNames = useMemo(() => {
    return regions.reduce((acc, region) => ({
      ...acc,
      [region.id]: region.name
    }), {} as Record<string, string>);
  }, [regions]);

  const sectorNames = useMemo(() => {
    return sectors.reduce((acc, sector) => ({
      ...acc,
      [sector.id]: sector.name
    }), {} as Record<string, string>);
  }, [sectors]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('schools')}</h1>
            <p className="text-muted-foreground">{t('schoolsDescription')}</p>
          </div>
          <div className="flex items-center gap-2">
            {(userRole === 'superadmin' || userRole === 'regionadmin') && (
              <>
                <Button onClick={handleAddDialogOpen}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addSchool')}
                </Button>
                <Button variant="outline" onClick={handleImportClick}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('importSchools')}
                </Button>
                <Button variant="outline" onClick={() => exportSchoolsToExcel(schools, regionNames, sectorNames)}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('exportSchools')}
                </Button>
                
                {schoolsWithAdminIssues > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={syncSchoolAdmins} 
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Admin sinxronlaşdır
                    <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                      {schoolsWithAdminIssues}
                    </Badge>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {schoolsWithAdminIssues > 0 && userRole === 'superadmin' && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
            <div className="text-amber-800">
              <p className="font-medium">Diqqət! {schoolsWithAdminIssues} məktəbdə admin əlaqələndirmə problemi var.</p>
              <p className="text-sm">Bu məktəblərdə admin e-poçtu təyin edilib, lakin admin ID əlaqələndirilməyib. Sinxronlaşdır düyməsini klikləyin və ya hər bir məktəb üçün admin məlumatlarını əl ilə yeniləyin.</p>
            </div>
          </div>
        )}

        <SchoolHeader 
          userRole={safeUserRole} 
          onAddClick={handleAddDialogOpen}
          onExportClick={handleExportClick}
          onImportClick={handleImportClick}
        />
        
        <Card>
          <CardContent className="p-6">
            <SchoolFilters 
              searchTerm={searchTerm}
              selectedRegion={selectedRegion}
              selectedSector={selectedSector}
              selectedStatus={selectedStatus}
              filteredSectors={filteredSectors}
              regions={regions}
              handleSearch={handleSearch}
              handleRegionFilter={handleRegionFilter}
              handleSectorFilter={handleSectorFilter}
              handleStatusFilter={handleStatusFilter}
              resetFilters={resetFilters}
            />
            
            <SchoolTable 
              currentItems={currentItems}
              searchTerm={searchTerm}
              sortConfig={sortConfig as SortConfig}
              handleSort={handleSort}
              handleEditDialogOpen={handleEditDialogOpen}
              handleDeleteDialogOpen={handleDeleteDialogOpen}
              handleAdminDialogOpen={handleAdminDialogOpen}
              userRole={safeUserRole}
            />
            
            {totalPages > 1 && (
              <SchoolPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </CardContent>
        </Card>
        
        <SchoolDialogs
          isDeleteDialogOpen={isDeleteDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          isAddDialogOpen={isAddDialogOpen}
          isAdminDialogOpen={isAdminDialogOpen}
          selectedSchool={selectedSchool}
          selectedAdmin={selectedAdmin}
          closeDeleteDialog={closeDeleteDialog}
          closeEditDialog={closeEditDialog}
          closeAddDialog={closeAddDialog}
          closeAdminDialog={closeAdminDialog}
          handleDeleteConfirm={handleDeleteConfirm}
          handleAddSubmit={handleAddSubmit}
          handleEditSubmit={handleEditSubmit}
          handleAdminUpdate={handleAdminUpdate}
          handleResetPassword={handleResetPassword}
          formData={formData}
          handleFormChange={handleFormChange}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          filteredSectors={filteredSectors}
        />
        
        <ImportDialog 
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onImport={handleImportSchools}
        />
      </div>
    </TooltipProvider>
  );
};

export default SchoolsContainer;
