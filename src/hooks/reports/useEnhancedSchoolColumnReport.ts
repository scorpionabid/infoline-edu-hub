
// hooks/reports/useEnhancedSchoolColumnReport.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  EnhancedSchoolData, 
  ColumnDefinition, 
  ReportFilters, 
  SchoolColumnReportData 
} from '@/types/reports/schoolColumnReport';

export const useEnhancedSchoolColumnReport = (categoryId?: string) => {
  const [data, setData] = useState<SchoolColumnReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<ReportFilters>({
    schools: {
      search: '',
      region_id: undefined,
      sector_id: undefined,
      status: 'active'
    },
    columns: {
      category_id: categoryId,
      selected_column_ids: []
    }
  });

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!data) return null;

    const filteredSchools = data.schools.filter(school => {
      // School search filter
      if (filters.schools.search) {
        const searchLower = filters.schools.search.toLowerCase();
        if (!school.name.toLowerCase().includes(searchLower) &&
            !school.region_name.toLowerCase().includes(searchLower) &&
            !school.sector_name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Region filter
      if (filters.schools.region_id && school.region_id !== filters.schools.region_id) {
        return false;
      }

      // Sector filter
      if (filters.schools.sector_id && school.sector_id !== filters.schools.sector_id) {
        return false;
      }

      // Status filter
      if (filters.schools.status && school.status !== filters.schools.status) {
        return false;
      }

      return true;
    });

    // Filter columns based on selected columns
    const filteredColumns = filters.columns.selected_column_ids.length > 0
      ? data.columns.filter(col => filters.columns.selected_column_ids.includes(col.id))
      : data.columns;

    return {
      ...data,
      schools: filteredSchools,
      columns: filteredColumns
    };
  }, [data, filters]);

  // Fetch available columns for selected category
  const fetchColumns = useCallback(async (catId?: string) => {
    if (!catId) return [];

    try {
      // First get the category info
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('id', catId)
        .single();

      if (categoryError) throw categoryError;

      // Then get columns for this category
      const { data: columns, error } = await supabase
        .from('columns')
        .select(`
          id,
          name,
          type,
          category_id,
          is_required,
          order_index
        `)
        .eq('category_id', catId)
        .eq('status', 'active')
        .order('order_index');

      if (error) throw error;

      return columns.map(col => ({
        id: col.id,
        name: col.name,
        type: col.type,
        category_id: col.category_id,
        category_name: category.name,
        is_required: col.is_required,
        order_index: col.order_index
      })) as ColumnDefinition[];
    } catch (err: any) {
      console.error('Error fetching columns:', err);
      return [];
    }
  }, []);

  // Fetch schools and their data
  const fetchSchoolsData = useCallback(async (columnIds: string[] = []) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch basic school info
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          principal_name,
          region_id,
          sector_id,
          status,
          regions!inner(name),
          sectors!inner(name)
        `)
        .eq('status', 'active');

      if (schoolsError) throw schoolsError;

      // If no columns selected, return schools with empty data
      if (columnIds.length === 0) {
        const enhancedSchools: EnhancedSchoolData[] = schools.map(school => ({
          id: school.id,
          name: school.name,
          principal_name: school.principal_name,
          region_id: school.region_id,
          region_name: school.regions.name,
          sector_id: school.sector_id,
          sector_name: school.sectors.name,
          status: school.status,
          completion_rate: 0,
          columns: {},
          completion_stats: {
            total_required: 0,
            filled_count: 0,
            approved_count: 0,
            completion_rate: 0
          }
        }));

        return enhancedSchools;
      }

      // Fetch data entries for selected columns (only approved)
      const { data: entries, error: entriesError } = await supabase
        .from('data_entries')
        .select(`
          id,
          school_id,
          column_id,
          value,
          status,
          created_at,
          updated_at,
          approved_by,
          approved_at
        `)
        .in('column_id', columnIds)
        .in('school_id', schools.map(s => s.id))
        .eq('status', 'approved'); // Only fetch approved entries

      if (entriesError) throw entriesError;

      // Group entries by school
      const entriesBySchool = entries.reduce((acc, entry) => {
        if (!acc[entry.school_id]) {
          acc[entry.school_id] = {};
        }
        acc[entry.school_id][entry.column_id] = entry;
        return acc;
      }, {} as Record<string, Record<string, any>>);

      // Combine school info with column data
      const enhancedSchools: EnhancedSchoolData[] = schools.map(school => {
        const schoolEntries = entriesBySchool[school.id] || {};
        const totalRequired = columnIds.length;
        const filledCount = Object.keys(schoolEntries).length; // Filled approved entries
        const approvedCount = filledCount; // All fetched entries are approved
        const completionRate = totalRequired > 0 ? Math.round((approvedCount / totalRequired) * 100) : 0;

        return {
          id: school.id,
          name: school.name,
          principal_name: school.principal_name,
          region_id: school.region_id,
          region_name: school.regions.name,
          sector_id: school.sector_id,
          sector_name: school.sectors.name,
          status: school.status,
          completion_rate: completionRate,
          columns: schoolEntries,
          completion_stats: {
            total_required: totalRequired,
            filled_count: filledCount,
            approved_count: approvedCount,
            completion_rate: completionRate
          }
        };
      });

      return enhancedSchools;
    } catch (err: any) {
      console.error('Error fetching schools data:', err);
      throw err;
    }
  }, []);

  // Main data loading function
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch columns if category is selected
      const columns = filters.columns.category_id 
        ? await fetchColumns(filters.columns.category_id)
        : [];

      // Use selected columns or all columns
      const columnIds = filters.columns.selected_column_ids.length > 0
        ? filters.columns.selected_column_ids
        : columns.map(col => col.id);

      // Fetch schools data
      const schools = await fetchSchoolsData(columnIds);

      setData({
        schools,
        columns,
        total_schools: schools.length,
        filters_applied: filters
      });
    } catch (err: any) {
      setError(err.message || 'Məlumatlar yüklənərkən xəta baş verdi');
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [filters, fetchColumns, fetchSchoolsData]);

  // Update category filter when categoryId changes and auto-select all columns
  useEffect(() => {
    if (categoryId) {
      setFilters(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          category_id: categoryId,
          selected_column_ids: [] // Reset column selection when category changes
        }
      }));
    }
  }, [categoryId]);

  // Auto-select all columns when columns are loaded
  useEffect(() => {
    if (data?.columns && data.columns.length > 0 && filters.columns.selected_column_ids.length === 0) {
      setFilters(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          selected_column_ids: data.columns.map(col => col.id)
        }
      }));
    }
  }, [data?.columns]);

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({
      schools: { ...prev.schools, ...(newFilters.schools || {}) },
      columns: { ...prev.columns, ...(newFilters.columns || {}) }
    }));
  }, []);

  // Toggle column selection
  const toggleColumnSelection = useCallback((columnId: string) => {
    setFilters(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        selected_column_ids: prev.columns.selected_column_ids.includes(columnId)
          ? prev.columns.selected_column_ids.filter(id => id !== columnId)
          : [...prev.columns.selected_column_ids, columnId]
      }
    }));
  }, []);

  // Select all columns
  const selectAllColumns = useCallback(() => {
    if (data?.columns) {
      setFilters(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          selected_column_ids: data.columns.map(col => col.id)
        }
      }));
    }
  }, [data?.columns]);

  // Clear column selection
  const clearColumnSelection = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        selected_column_ids: []
      }
    }));
  }, []);

  return {
    data: filteredData,
    loading,
    error,
    filters,
    updateFilters,
    toggleColumnSelection,
    selectAllColumns,
    clearColumnSelection,
    loadData
  };
};
