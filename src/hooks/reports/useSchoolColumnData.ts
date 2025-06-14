import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleBasedReports } from '@/hooks/reports/useRoleBasedReports';
import { 
  School, 
  Column, 
  SchoolColumnData, 
  transformSchoolsData, 
  transformColumnsData,
  sortSchoolColumnData,
  ColumnSort
} from '@/utils/reports/schoolColumnDataUtils';
import { FilterState } from './useSchoolColumnFilters';

export const useSchoolColumnData = (
  filters: FilterState,
  debouncedSearchQuery: string
) => {
  // Data states
  const [schools, setSchools] = useState<School[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [schoolColumnData, setSchoolColumnData] = useState<SchoolColumnData[]>([]);
  
  // Dropdown data
  const [regions, setRegions] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Selection states
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>([]);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting
  const [columnSort, setColumnSort] = useState<ColumnSort>({ columnId: '', order: null });

  const { userRole, loading: roleLoading, permissions } = useRoleBasedReports();

  // Fetch functions
  const fetchRegions = useCallback(async () => {
    try {
      let query = supabase.from('regions').select('id, name').eq('status', 'active');
      
      if (permissions?.restrictions.region_id) {
        query = query.eq('id', permissions.restrictions.region_id);
      }
      
      const { data, error } = await query.order('name');
      if (error) throw error;
      setRegions(data || []);
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  }, [permissions]);

  const fetchSectors = useCallback(async () => {
    try {
      let query = supabase.from('sectors').select('id, name, region_id').eq('status', 'active');
      
      if (permissions?.restrictions.region_id) {
        query = query.eq('region_id', permissions.restrictions.region_id);
      }
      
      if (permissions?.restrictions.sector_id) {
        query = query.eq('id', permissions.restrictions.sector_id);
      }
      
      const { data, error } = await query.order('name');
      if (error) throw error;
      setSectors(data || []);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  }, [permissions]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchColumns = useCallback(async () => {
    try {
      let query = supabase
        .from('columns')
        .select(`
          id,
          name,
          type,
          category_id,
          is_required,
          order_index,
          categories!inner(name)
        `)
        .eq('status', 'active');

      if (filters.selectedCategory && filters.selectedCategory !== 'all') {
        query = query.eq('category_id', filters.selectedCategory);
      }
      
      const { data, error } = await query.order('order_index');
      if (error) throw error;
      
      const transformedColumns = transformColumnsData(data);
      setColumns(transformedColumns);
    } catch (err) {
      console.error('Error fetching columns:', err);
    }
  }, [filters.selectedCategory]);

  const fetchSchools = useCallback(async () => {
    try {
      let query = supabase
        .from('schools')
        .select(`
          id,
          name,
          completion_rate,
          student_count,
          teacher_count,
          regions!inner(name),
          sectors!inner(name)
        `)
        .eq('status', 'active');

      // Apply role-based restrictions
      if (permissions?.restrictions.region_id) {
        query = query.eq('region_id', permissions.restrictions.region_id);
      }
      
      if (permissions?.restrictions.sector_id) {
        query = query.eq('sector_id', permissions.restrictions.sector_id);
      }
      
      if (permissions?.restrictions.school_id) {
        query = query.eq('id', permissions.restrictions.school_id);
      }

      // Apply user filters
      if (filters.selectedRegion && filters.selectedRegion !== 'all') {
        query = query.eq('region_id', filters.selectedRegion);
      }
      
      if (filters.selectedSector && filters.selectedSector !== 'all') {
        query = query.eq('sector_id', filters.selectedSector);
      }
      
      if (debouncedSearchQuery) {
        query = query.ilike('name', `%${debouncedSearchQuery}%`);
      }
      
      const { data, error } = await query.order('name');
      if (error) throw error;
      
      const transformedSchools = transformSchoolsData(data);
      setSchools(transformedSchools);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.message || 'Məktəblər yüklənərkən xəta baş verdi');
    }
  }, [filters, debouncedSearchQuery, permissions]);

  // fetchSchoolColumnData callback-i artıq lazım deyil, useEffect içərisində inline istifadə edirik

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchRegions(),
          fetchSectors(),
          fetchCategories(),
          fetchColumns(),
          fetchSchools()
        ]);
      } catch (err: any) {
        setError(err.message || 'Məlumatlar yüklənərkən xəta baş verdi');
      } finally {
        setLoading(false);
      }
    };

    if (!roleLoading) {
      loadInitialData();
    }
  }, [roleLoading, fetchRegions, fetchSectors, fetchCategories, fetchColumns, fetchSchools]);

  // Fetch filtered data when filters change
  useEffect(() => {
    if (!loading) {
      fetchSchools();
      fetchColumns();
    }
  }, [filters.selectedRegion, filters.selectedSector, filters.selectedCategory, fetchSchools, fetchColumns, loading]);

  // Fetch filtered data when search changes
  useEffect(() => {
    if (!loading) {
      fetchSchools();
    }
  }, [debouncedSearchQuery, fetchSchools, loading]);

  // Auto-select columns when category changes
  useEffect(() => {
    if (columns.length > 0 && filters.selectedCategory !== 'all') {
      const activeColumns = columns.filter(col => col.category_id === filters.selectedCategory);
      setSelectedColumnIds(activeColumns.map(col => col.id));
    } else if (filters.selectedCategory === 'all') {
      setSelectedColumnIds([]);
    }
  }, [columns, filters.selectedCategory]);

  // Fetch school-column data when selections change
  useEffect(() => {
    const fetchData = async () => {
      const schoolsToUse = selectedSchoolIds.length > 0 
        ? schools.filter(s => selectedSchoolIds.includes(s.id))
        : schools;
      
      if (selectedColumnIds.length === 0 || schoolsToUse.length === 0) return;
      
      setDataLoading(true);
      try {
        const schoolIds = schoolsToUse.map(s => s.id);
        
        const { data, error } = await supabase
          .from('data_entries')
          .select(`
            school_id,
            column_id,
            value,
            status,
            created_at,
            updated_at
          `)
          .in('school_id', schoolIds)
          .in('column_id', selectedColumnIds);
        
        if (error) throw error;
        
        // Transform data into structured format
        const schoolDataMap: { [schoolId: string]: SchoolColumnData } = {};
        
        // Initialize with school info
        schoolsToUse.forEach(school => {
          schoolDataMap[school.id] = {
            school_id: school.id,
            school_name: school.name,
            region_name: school.region_name,
            sector_name: school.sector_name,
            columns: {}
          };
        });
        
        // Add column data
        (data || []).forEach(entry => {
          if (schoolDataMap[entry.school_id]) {
            schoolDataMap[entry.school_id].columns[entry.column_id] = {
              value: entry.value,
              status: entry.status,
              created_at: entry.created_at,
              updated_at: entry.updated_at
            };
          }
        });
        
        let schoolData = Object.values(schoolDataMap);
        
        // Apply sorting
        schoolData = sortSchoolColumnData(schoolData, columnSort);
        
        setSchoolColumnData(schoolData);
      } catch (err: any) {
        console.error('Error fetching school column data:', err);
        setError(err.message || 'Məktəb sütun məlumatları yüklənərkən xəta baş verdi');
      } finally {
        setDataLoading(false);
      }
    };

    if (selectedColumnIds.length > 0 && schools.length > 0) {
      fetchData();
    }
  }, [selectedColumnIds, selectedSchoolIds, schools, columnSort]); // Directly use schools in dependency

  return {
    // Data
    schools,
    columns,
    schoolColumnData,
    regions,
    sectors,
    categories,
    
    // Selections
    selectedColumnIds,
    setSelectedColumnIds,
    selectedSchoolIds,
    setSelectedSchoolIds,
    
    // Sorting
    columnSort,
    setColumnSort,
    
    // Loading states
    loading,
    dataLoading,
    error,
    
    // Permissions - include the actual permissions object
    permissions
  };
};
