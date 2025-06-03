import React, { useState, useEffect } from 'react';
import { SchoolHeaderContainer } from './SchoolHeaderContainer';
import { SchoolFiltersContainer } from './SchoolFiltersContainer';
import { SchoolTableContainer } from './SchoolTableContainer';
import { SchoolDialogsContainer } from './SchoolDialogsContainer';
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';
import { useRegionsQuery } from '@/hooks/api/regions/useRegionsQuery';
import { useSectorsQuery } from '@/hooks/api/sectors/useSectorsQuery';
import { School, Region, Sector } from '@/types/school';
import { adaptSchoolsArrayFromSupabase, adaptRegionsArrayFromSupabase, adaptSectorsArrayFromSupabase } from '@/utils/typeAdapters';

export const SchoolsContainerRefactored: React.FC = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false);
  const [selectedSchoolForFiles, setSelectedSchoolForFiles] = useState<School | null>(null);
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [selectedSchoolForLinks, setSelectedSchoolForLinks] = useState<School | null>(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [schoolForAdmin, setSchoolForAdmin] = useState<School | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  const {
    schools: initialSchools,
    loading,
    deleteSchool,
    error,
    refresh
  } = useSchoolsQuery();

  const { regions: initialRegions } = useRegionsQuery();
  const { sectors: initialSectors } = useSectorsQuery();

  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    if (initialSchools) {
      setSchools(initialSchools);
    }
  }, [initialSchools]);

  useEffect(() => {
    if (initialRegions) {
      setRegions(initialRegions);
    }
  }, [initialRegions]);

  useEffect(() => {
    if (initialSectors) {
      setSectors(initialSectors);
    }
  }, [initialSectors]);

  const handleDeleteSchool = (school: School) => {
    setSchoolToDelete(school);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteSchool = async () => {
    if (schoolToDelete) {
      await deleteSchool(schoolToDelete.id || '');
      setIsDeleteDialogOpen(false);
      setSchoolToDelete(null);
      refresh();
    }
  };

  const handleViewFiles = (school: School) => {
    setSelectedSchoolForFiles(school);
    setIsFilesDialogOpen(true);
  };

  const handleViewLinks = (school: School) => {
    setSelectedSchoolForLinks(school);
    setIsLinksDialogOpen(true);
  };

  const handleAssignAdmin = (school: School) => {
    setSchoolForAdmin(school);
    setIsAdminDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDeleteDialogOpen(false);
    setIsFilesDialogOpen(false);
    setIsLinksDialogOpen(false);
    setIsAdminDialogOpen(false);
    setSchoolToDelete(null);
    setSelectedSchoolForFiles(null);
    setSelectedSchoolForLinks(null);
    setSchoolForAdmin(null);
  };

  const regionNames: Record<string, string> = regions.reduce((acc: Record<string, string>, region: Region) => {
    acc[region.id] = region.name;
    return acc;
  }, {});

  const sectorNames: Record<string, string> = sectors.reduce((acc: Record<string, string>, sector: Sector) => {
    acc[sector.id] = sector.name;
    return acc;
  }, {});

  const [filters, setFilters] = useState({
    search: '',
    region: '',
    sector: '',
    status: ''
  });

  const filteredSchools = schools.filter(school => {
    const searchRegex = new RegExp(filters.search, 'i');
    const matchesSearch = searchRegex.test(school.name);
    const matchesRegion = filters.region === '' || school.region_id === filters.region;
    const matchesSector = filters.sector === '' || school.sector_id === filters.sector;
    const matchesStatus = filters.status === '' || school.status === filters.status;

    return matchesSearch && matchesRegion && matchesSector && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <SchoolHeaderContainer />
      
      <SchoolFiltersContainer />

      <SchoolTableContainer
        schools={adaptSchoolsArrayFromSupabase(filteredSchools)}
        isLoading={loading}
        onEdit={setEditingSchool}
        onDelete={handleDeleteSchool}
        onViewFiles={handleViewFiles}
        onViewLinks={handleViewLinks}
        onAssignAdmin={handleAssignAdmin}
        regions={adaptRegionsArrayFromSupabase(regions)}
        sectors={adaptSectorsArrayFromSupabase(sectors)}
        regionNames={regionNames}
        sectorNames={sectorNames}
      />

      <SchoolDialogsContainer
        isDeleteDialogOpen={isDeleteDialogOpen}
        onDeleteDialogClose={() => setIsDeleteDialogOpen(false)}
        onDeleteConfirm={confirmDeleteSchool}
        schoolToDelete={schoolToDelete}
        isDeleting={false}
        isAdminDialogOpen={isAdminDialogOpen}
        onAdminDialogClose={() => setIsAdminDialogOpen(false)}
        schoolForAdmin={schoolForAdmin}
        onAdminSubmit={async () => {}}
        isSubmittingAdmin={false}
      />
    </div>
  );
};
