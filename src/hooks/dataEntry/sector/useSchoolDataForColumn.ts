
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SchoolDataEntry {
  schoolId: string;
  schoolName: string;
  sectorName: string;
  regionName: string;
  currentValue?: string;
  status: 'pending' | 'approved' | 'rejected' | 'empty';
  lastUpdated?: string;
  submittedBy?: string;
}

interface UseSchoolDataForColumnResult {
  schoolData: SchoolDataEntry[];
  isLoadingSchoolData: boolean;
  error: string | null;
  loadSchoolData: (columnId: string, entityId: string, entityType?: 'sector' | 'region' | 'school') => Promise<void>;
  refreshSchoolData: () => Promise<void>;
}

export const useSchoolDataForColumn = (): UseSchoolDataForColumnResult => {
  const [schoolData, setSchoolData] = useState<SchoolDataEntry[]>([]);
  const [isLoadingSchoolData, setIsLoadingSchoolData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadParams, setLastLoadParams] = useState<{ columnId: string; sectorId: string; entityType?: 'sector' | 'region' | 'school' } | null>(null);

  const loadSchoolData = useCallback(async (columnId: string, entityId: string, entityType: 'sector' | 'region' | 'school' = 'sector') => {
    setIsLoadingSchoolData(true);
    setError(null);
    setLastLoadParams({ columnId, sectorId: entityId, entityType });

    try {
      console.log('Loading school data for column:', columnId, 'entity:', entityId, 'type:', entityType);

      // Build the query based on entity type
      let schoolsQuery = supabase
        .from('schools')
        .select(`
          id,
          name,
          sector_id,
          region_id,
          status,
          sectors(
            id,
            name,
            regions(
              id,
              // name
            )
          )
        `)
        .eq('status', 'active');

      // Filter by sector, region or specific school
      if (entityType === 'sector') {
        schoolsQuery = schoolsQuery.eq('sector_id', entityId);
      } else if (entityType === 'region') {
        schoolsQuery = schoolsQuery.eq('region_id', entityId);
      } else if (entityType === 'school') {
        schoolsQuery = schoolsQuery.eq('id', entityId);
      }

      const { data: schools, error: schoolsError } = await schoolsQuery;

      if (schoolsError) {
        console.error('Schools query error:', schoolsError);
        throw new Error(`Schools fetch error: ${schoolsError.message}`);
      }

      console.log('Schools query result:', {
        found: schools?.length || 0,
        entityId,
        entityType,
        schools: schools?.map(s => ({ 
          id: s.id, 
          name: s.name, 
          sector_id: s.sector_id, 
          region_id: s.region_id 
        })) || []
      });

      if (!schools || schools.length === 0) {
        // Debug: Check if any schools exist
        const { data: allSchools, error: allSchoolsError } = await supabase
          .from('schools')
          .select('id, name, sector_id, region_id, status')
          .limit(10);
        
        console.log('Debug - All schools (first 10):', {
          count: allSchools?.length || 0,
          schools: allSchools?.map(s => ({ 
            id: s.id, 
            name: s.name, 
            sector_id: s.sector_id,
            region_id: s.region_id, 
            status: s.status,
            matchesSector: s.sector_id === entityId,
            matchesRegion: s.region_id === entityId
          })) || []
        });
        
        setSchoolData([]);
        return;
      }

      // Get school IDs for data entries query
      const schoolIds = schools.map(school => school.id);

      // Get existing data entries for these schools and the selected column
      const { data: dataEntries, error: dataError } = await supabase
        .from('data_entries')
        .select(`
          school_id,
          value,
          status,
          updated_at,
          created_by,
          profiles(
            // full_name
          )
        `)
        .eq('column_id', columnId)
        .in('school_id', schoolIds);

      if (dataError) {
        console.warn('Data entries fetch error:', dataError.message);
        // Continue even if data entries fetch fails
      }

      console.log('Data entries found:', dataEntries?.length || 0);

      // Map schools with their data entries
      const schoolDataMap: { [key: string]: SchoolDataEntry } = {};

      schools.forEach(school => {
        // Type-safe access to nested data with proper null checking
        const sectorsData = school.sectors;
        let sectorName = 'Bilinmir';
        let regionName = 'Bilinmir';

        if (sectorsData) {
          // Handle both single object and array cases
          const sectorInfo = Array.isArray(sectorsData) ? sectorsData[0] : sectorsData;
          if (sectorInfo && typeof sectorInfo === 'object' && 'name' in sectorInfo) {
            sectorName = sectorInfo.name || 'Bilinmir';
            
            // Handle regions data
            const regionsData = sectorInfo.regions;
            if (regionsData) {
              const regionInfo = Array.isArray(regionsData) ? regionsData[0] : regionsData;
              if (regionInfo && typeof regionInfo === 'object' && 'name' in regionInfo) {
                regionName = regionInfo.name || 'Bilinmir';
              }
            }
          }
        }

        schoolDataMap[school.id] = {
          schoolId: school.id,
          schoolName: school.name,
          sectorName,
          regionName,
          currentValue: undefined,
          status: 'empty',
          lastUpdated: undefined,
          submittedBy: undefined
        };
      });

      // Update with existing data entries
      if (dataEntries) {
        dataEntries.forEach(entry => {
          if (schoolDataMap[entry.school_id]) {
            // Handle profiles data safely
            const profilesData = entry.profiles;
            let submittedBy = 'Bilinmir';
            
            if (profilesData) {
              const profileInfo = Array.isArray(profilesData) ? profilesData[0] : profilesData;
              if (profileInfo && typeof profileInfo === 'object' && 'full_name' in profileInfo) {
                submittedBy = profileInfo.full_name || 'Bilinmir';
              }
            }
            
            schoolDataMap[entry.school_id] = {
              ...schoolDataMap[entry.school_id],
              currentValue: entry.value || undefined,
              status: entry.status as 'pending' | 'approved' | 'rejected',
              lastUpdated: entry.updated_at || undefined,
              // submittedBy
            };
          }
        });
      }

      const finalSchoolData = Object.values(schoolDataMap);
      console.log('Final school data:', finalSchoolData.length);

      setSchoolData(finalSchoolData);

    } catch (err: any) {
      console.error('Error loading school data:', err);
      setError(err.message);
      toast.error('Məktəb məlumatları yüklənərkən xəta baş verdi: ' + err.message);
    } finally {
      setIsLoadingSchoolData(false);
    }
  }, []);

  const refreshSchoolData = useCallback(async () => {
    if (lastLoadParams) {
      await loadSchoolData(lastLoadParams.columnId, lastLoadParams.sectorId, lastLoadParams.entityType);
    }
  }, [lastLoadParams, loadSchoolData]);

  return {
    schoolData,
    isLoadingSchoolData,
    error,
    loadSchoolData,
    // refreshSchoolData
  };
};
