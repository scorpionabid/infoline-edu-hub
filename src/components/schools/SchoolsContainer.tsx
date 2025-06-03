
import React, { useState, useEffect, useCallback } from 'react';
import { SchoolHeader } from './SchoolHeader';
import { SchoolTable } from './SchoolTable';
import { SchoolFilters } from './SchoolFilters';
import { SchoolDialogsContainer } from './SchoolDialogsContainer';
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';
import { useRegions } from '@/hooks/regions';
import { useSectors } from '@/hooks/sectors';
import { useSchoolDialogHandlers } from '@/hooks/schools';
import { adaptSchoolsArrayFromSupabase, adaptRegionsArrayFromSupabase, adaptSectorsArrayFromSupabase, adaptSchoolFromSupabase } from '@/utils/typeAdapters';

export const SchoolsContainer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<any>(null);
  const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false);
  const [selectedSchoolForFiles, setSelectedSchoolForFiles] = useState<any>(null);
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [selectedSchoolForLinks, setSelectedSchoolForLinks] = useState<any>(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [schoolForAdmin, setSchoolForAdmin] = useState<any>(null);
  const [editingSchool, setEditingSchool] = useState<any>(null);
  const {
    schools,
    loading,
    deleteSchool
  } = useSchoolsQuery();
  const { regions, loading: loadingRegions } = useRegions();
  const { sectors, loading: loadingSectors } = useSectors();
  const {
    handleDeleteSchool,
    handleViewFiles,
    handleViewLinks,
    handleAssignAdmin,
    handleAddClick
  } = useSchoolDialogHandlers({
    setIsFilesDialogOpen,
    setSelectedSchoolForFiles,
    setIsLinksDialogOpen,
    setSelectedSchoolForLinks,
    setIsAdminDialogOpen,
    setSchoolForAdmin,
    setEditingSchool
  });

  const regionNames = React.useMemo(() => {
    return regions.reduce((acc: Record<string, string>, region: any) => {
      acc[region.id] = region.name;
      return acc;
    }, {});
  }, [regions]);

  const sectorNames = React.useMemo(() => {
    return sectors.reduce((acc: Record<string, string>, sector: any) => {
      acc[sector.id] = sector.name;
      return acc;
    }, {});
  }, [sectors]);

  const filteredSchools = React.useMemo(() => {
    let filtered = schools || [];
    if (searchQuery) {
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedRegion) {
      filtered = filtered.filter(school => school.region_id === selectedRegion);
    }
    if (selectedSector) {
      filtered = filtered.filter(school => school.sector_id === selectedSector);
    }
    return filtered;
  }, [schools, searchQuery, selectedRegion, selectedSector]);

  return (
    <div className="space-y-6">
      <SchoolHeader onAddClick={handleAddClick} />
      
      <SchoolFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        regions={regions}
        sectors={sectors}
        loadingRegions={loadingRegions}
        loadingSectors={loadingSectors}
      />

      <SchoolTable
        schools={filteredSchools}
        isLoading={loading}
        onEdit={setEditingSchool}
        onDelete={(school) => {
          setSchoolToDelete(school);
          setIsDeleteDialogOpen(true);
        }}
        onViewFiles={handleViewFiles}
        onViewLinks={handleViewLinks}
        onAssignAdmin={handleAssignAdmin}
        regionNames={regionNames}
        sectorNames={sectorNames}
      />

      <SchoolDialogsContainer
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteDialogClose={() => setIsDeleteDialogOpen(false)}
        onDeleteConfirm={async () => {
          if (schoolToDelete) {
            await deleteSchool(schoolToDelete.id);
            setIsDeleteDialogOpen(false);
          }
        }}
        schoolToDelete={schoolToDelete}
        isDeleting={loading}
        isAdminDialogOpen={isAdminDialogOpen}
        onAdminDialogClose={() => setIsAdminDialogOpen(false)}
        schoolForAdmin={schoolForAdmin}
        onAdminSubmit={async (adminData: any) => {
          console.log('Admin data submitted:', adminData);
          setIsAdminDialogOpen(false);
        }}
        isSubmittingAdmin={loading}
      />
    </div>
  );
};

// Add default export
export default SchoolsContainer;
