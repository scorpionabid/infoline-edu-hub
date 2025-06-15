
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { School, SchoolStatus } from '@/types/school';
import { Region } from '@/types/region';
import { Sector } from '@/types/sector';
import SchoolsContainer from '@/components/schools/SchoolsContainer';
import { Loader2 } from 'lucide-react';
import { ensureRegionStatus, ensureSectorStatus, ensureValidSchoolStatus } from '@/utils/buildFixes';

const Schools = () => {
  const { t } = useLanguageSafe();
  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch schools with pagination
      const { data: schoolsData, error: schoolsError, count } = await supabase
        .from('schools')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
        .order('name');

      if (schoolsError) throw schoolsError;
      
      // Transform schools with safe type casting
      const transformedSchools: School[] = (schoolsData || []).map(school => ({
        ...school,
        status: ensureValidSchoolStatus(school.status) as SchoolStatus
      }));
      
      setSchools(transformedSchools);
      setTotalCount(count || 0);

      // Fetch regions
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (regionsError) throw regionsError;

      // Safe type casting for regions
      const typedRegions = (regionsData || []).map(region => ({
        ...region,
        status: ensureRegionStatus(region.status) as 'active' | 'inactive'
      }));
      
      setRegions(typedRegions);

      // Fetch sectors
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (sectorsError) throw sectorsError;

      // Safe type casting for sectors
      const typedSectors = (sectorsData || []).map(sector => ({
        ...sector,
        status: ensureSectorStatus(sector.status) as 'active' | 'inactive'
      }));
      
      setSectors(typedSectors);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
  };

  // Create region and sector name mappings
  const regionNames = regions.reduce((acc, region) => {
    acc[region.id] = region.name;
    return acc;
  }, {} as Record<string, string>);

  const sectorNames = sectors.reduce((acc, sector) => {
    acc[sector.id] = sector.name;
    return acc;
  }, {} as Record<string, string>);

  const handleCreate = async (schoolData: any) => {
    // Implementation for creating schools
    console.log('Creating school:', schoolData);
  };

  const handleEdit = async (schoolData: School) => {
    // Implementation for editing schools
    console.log('Editing school:', schoolData);
  };

  const handleDelete = async (school: School) => {
    // Implementation for deleting schools
    console.log('Deleting school:', school);
  };

  const handleAssignAdmin = async (schoolId: string, userId: string) => {
    // Implementation for assigning admin
    console.log('Assigning admin:', schoolId, userId);
  };

  return (
    <>
      <Helmet>
        <title>{t('schools')} | InfoLine</title>
      </Helmet>

      <div className="container mx-auto py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-red-500">{t('errorFetchingData')}: {error}</div>
        ) : (
          <SchoolsContainer
            schools={schools}
            regions={regions}
            sectors={sectors}
            isLoading={loading}
            error={error}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onSchoolSelect={handleSchoolSelect}
            onRefresh={fetchData}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssignAdmin={handleAssignAdmin}
            regionNames={regionNames}
            sectorNames={sectorNames}
          />
        )}
      </div>
    </>
  );
};

export default Schools;
