
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  completion_rate?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: string;
  is_required: boolean;
  order_index: number;
  options?: any;
  validation?: any;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolDataEntry {
  id: string;
  school_id: string;
  school_name: string;
  category_id: string;
  column_id: string;
  value: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DataStats {
  totalEntries: number;
  completedEntries: number;
  pendingEntries: number;
  completionRate: number;
  totalSchools: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  emptyCount: number;
}

export interface DataManagementPermissions {
  canApprove: boolean;
  canEdit: boolean;
  canViewAll: boolean;
  role: string;
  sectorId?: string;
  regionId?: string;
}

export type DataManagementStep = 'category' | 'column' | 'data';

export const useDataManagement = () => {
  const { user, userRole } = useAuth();
  
  // React Query for categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Categories query error:', error);
        throw error;
      }
      return data as Category[];
    },
    retry: 1,
    refetchOnWindowFocus: false
  });
  
  const [columns, setColumns] = useState<Column[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolDataEntry[]>([]);
  const [stats, setStats] = useState<DataStats>({
    totalEntries: 0,
    completedEntries: 0,
    pendingEntries: 0,
    completionRate: 0,
    totalSchools: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    emptyCount: 0
  });

  // Workflow state
  const [currentStep, setCurrentStep] = useState<DataManagementStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [error, setError] = useState<string | null>(categoriesError?.message || null);

  // Loading states
  const [loading, setLoading] = useState({
    categories: categoriesLoading,
    columns: false,
    schoolData: false,
    saving: false
  });

  // Real permissions from auth context
  const permissions: DataManagementPermissions = {
    canApprove: userRole?.role === 'superadmin' || userRole?.role === 'regionadmin' || userRole?.role === 'sectoradmin',
    canEdit: true,
    canViewAll: userRole?.role === 'superadmin' || userRole?.role === 'regionadmin',
    role: userRole?.role || 'schooladmin',
    sectorId: userRole?.sector_id,
    regionId: userRole?.region_id
  };



  const loadColumns = async (categoryId: string) => {
    try {
      setLoading(prev => ({ ...prev, columns: true }));
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .order('order_index', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setColumns(data || []);
    } catch (error) {
      console.error('Error loading columns:', error);
      setError('Sütunları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(prev => ({ ...prev, columns: false }));
    }
  };

  const loadSchoolData = async (categoryId: string, columnId?: string) => {
    try {
      setLoading(prev => ({ ...prev, schoolData: true }));
      
      // Get schools based on user role
      let schoolsQuery = supabase
        .from('schools')
        .select(`
          id,
          name,
          region_id,
          sector_id
        `);
      
      // Apply role-based filtering
      if (permissions.role === 'sectoradmin' && permissions.sectorId) {
        schoolsQuery = schoolsQuery.eq('sector_id', permissions.sectorId);
      } else if (permissions.role === 'regionadmin' && permissions.regionId) {
        schoolsQuery = schoolsQuery.eq('region_id', permissions.regionId);
      } else if (permissions.role === 'schooladmin' && user?.id) {
        // Get school_id from user_roles
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('school_id')
          .eq('user_id', user.id)
          .eq('role', 'schooladmin')
          .single();
        
        if (userRole?.school_id) {
          schoolsQuery = schoolsQuery.eq('id', userRole.school_id);
        }
      }
      
      const { data: schools, error: schoolsError } = await schoolsQuery;
      
      if (schoolsError) {
        throw schoolsError;
      }
      
      // Get data entries if column is selected
      let dataEntries: any[] = [];
      if (columnId && schools) {
        const { data, error } = await supabase
          .from('data_entries')
          .select('*')
          .eq('category_id', categoryId)
          .eq('column_id', columnId)
          .in('school_id', schools.map(s => s.id));
        
        if (error) {
          console.error('Error loading data entries:', error);
        } else {
          dataEntries = data || [];
        }
      }
      
      // Combine schools with their data
      const schoolDataEntries: SchoolDataEntry[] = (schools || []).map(school => {
        const entry = dataEntries.find(e => e.school_id === school.id);
        return {
          id: entry?.id || `temp-${school.id}`,
          school_id: school.id,
          school_name: school.name,
          category_id: categoryId,
          column_id: columnId || '',
          value: entry?.value || '',
          status: entry?.status || 'empty',
          created_at: entry?.created_at || new Date().toISOString(),
          updated_at: entry?.updated_at || new Date().toISOString()
        };
      });
      
      setSchoolData(schoolDataEntries);
      
      // Calculate stats
      const totalSchools = schoolDataEntries.length;
      const pendingCount = schoolDataEntries.filter(s => s.status === 'pending').length;
      const approvedCount = schoolDataEntries.filter(s => s.status === 'approved').length;
      const rejectedCount = schoolDataEntries.filter(s => s.status === 'rejected').length;
      const emptyCount = schoolDataEntries.filter(s => s.status === 'empty').length;
      const completionRate = totalSchools > 0 ? Math.round(((approvedCount + pendingCount) / totalSchools) * 100) : 0;
      
      setStats(prev => ({
        ...prev,
        totalSchools,
        pendingCount,
        approvedCount,
        rejectedCount,
        emptyCount,
        completionRate
      }));
      
    } catch (error) {
      console.error('Error loading school data:', error);
      setError('Məktəb məlumatlarını yükləyərkən xəta baş verdi');
    } finally {
      setLoading(prev => ({ ...prev, schoolData: false }));
    }
  };

  // Navigation functions
  const goToStep = (step: DataManagementStep) => {
    setCurrentStep(step);
  };

  const resetWorkflow = () => {
    setCurrentStep('category');
    setSelectedCategory(null);
    setSelectedColumn(null);
    setColumns([]);
    setSchoolData([]);
    setError(null);
  };

  // Selection handlers
  const handleCategorySelect = async (category: Category) => {
    setSelectedCategory(category);
    setCurrentStep('column');
    await loadColumns(category.id);
  };

  const handleColumnSelect = async (column: Column) => {
    setSelectedColumn(column);
    setCurrentStep('data');
    await loadSchoolData(column.category_id, column.id);
  };

  // FIXED: Data management handlers - Column-level approval
  const handleDataSave = async (entityId: string, value: string): Promise<boolean> => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      if (!selectedColumn || !selectedCategory) {
        throw new Error('Kateqoriya və ya sütun seçilməyib');
      }
      
      // Handle sector data separately
      if (selectedCategory.assignment === 'sectors') {
        // For sector data, use sector_data_entries table
        const { data: existingSectorEntry } = await supabase
          .from('sector_data_entries')
          .select('id')
          .eq('sector_id', permissions.sectorId || entityId)
          .eq('category_id', selectedCategory.id)
          .eq('column_id', selectedColumn.id)
          .single();
          
        if (existingSectorEntry) {
          // Update existing entry
          const { error } = await supabase
            .from('sector_data_entries')
            .update({
              value,
              status: 'approved',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSectorEntry.id);
            
          if (error) throw error;
        } else {
          // Create new entry
          const { error } = await supabase
            .from('sector_data_entries')
            .insert({
              sector_id: permissions.sectorId || entityId,
              category_id: selectedCategory.id,
              column_id: selectedColumn.id,
              value,
              status: 'approved',
              created_by: user?.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (error) throw error;
        }
        
        return true;
      }
      
      // Handle school data
      const { data: existingEntry } = await supabase
        .from('data_entries')
        .select('id')
        .eq('school_id', entityId)
        .eq('category_id', selectedCategory.id)
        .eq('column_id', selectedColumn.id)
        .single();
      
      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('data_entries')
          .update({
            value,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
        
        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('data_entries')
          .insert({
            school_id: entityId,
            category_id: selectedCategory.id,
            column_id: selectedColumn.id,
            value,
            status: 'pending',
            created_by: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }
      
      // Refresh data only for school data
      await loadSchoolData(selectedCategory.id, selectedColumn.id);
      return true;
      
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // FIXED: Column-level approval - only approve specific school+column combination
  const handleDataApprove = async (schoolId: string, comment?: string): Promise<boolean> => {
    try {
      if (!selectedColumn || !selectedCategory) {
        throw new Error('Kateqoriya və ya sütun seçilməyib');
      }
      
      console.log(`[handleDataApprove] Approving: school=${schoolId}, column=${selectedColumn.id}, category=${selectedCategory.id}`);
      
      // FIXED: Only update the specific school+column combination
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('column_id', selectedColumn.id); // FIXED: Filter by column_id only, not category_id
      
      if (error) {
        console.error('Approval error:', error);
        throw error;
      }
      
      console.log(`[handleDataApprove] Successfully approved entry for school ${schoolId}, column ${selectedColumn.name}`);
      
      // Refresh data to show updated status
      await loadSchoolData(selectedCategory.id, selectedColumn.id);
      return true;
    } catch (error) {
      console.error('Error approving data:', error);
      return false;
    }
  };

  // FIXED: Column-level rejection - only reject specific school+column combination
  const handleDataReject = async (schoolId: string, reason: string, comment?: string): Promise<boolean> => {
    try {
      if (!selectedColumn || !selectedCategory) {
        throw new Error('Kateqoriya və ya sütun seçilməyib');
      }
      
      console.log(`[handleDataReject] Rejecting: school=${schoolId}, column=${selectedColumn.id}, reason=${reason}`);
      
      // FIXED: Only update the specific school+column combination
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_by: user?.id,
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('column_id', selectedColumn.id); // FIXED: Filter by column_id only, not category_id
      
      if (error) {
        console.error('Rejection error:', error);
        throw error;
      }
      
      console.log(`[handleDataReject] Successfully rejected entry for school ${schoolId}, column ${selectedColumn.name}`);
      
      // Refresh data to show updated status
      await loadSchoolData(selectedCategory.id, selectedColumn.id);
      return true;
    } catch (error) {
      console.error('Error rejecting data:', error);
      return false;
    }
  };

  // FIXED: Bulk approve - only for current column
  const handleBulkApprove = async (schoolIds: string[]): Promise<boolean> => {
    try {
      if (!selectedColumn || !selectedCategory) {
        throw new Error('Kateqoriya və ya sütun seçilməyib');
      }
      
      console.log(`[handleBulkApprove] Bulk approving ${schoolIds.length} schools for column ${selectedColumn.name}`);
      
      // FIXED: Bulk approve only for specific column
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('column_id', selectedColumn.id)
        .in('school_id', schoolIds);
      
      if (error) {
        console.error('Bulk approval error:', error);
        throw error;
      }
      
      console.log(`[handleBulkApprove] Successfully bulk approved ${schoolIds.length} entries for column ${selectedColumn.name}`);
      
      // Refresh data
      await loadSchoolData(selectedCategory.id, selectedColumn.id);
      return true;
    } catch (error) {
      console.error('Error bulk approving:', error);
      return false;
    }
  };

  // FIXED: Bulk reject - only for current column
  const handleBulkReject = async (schoolIds: string[], reason: string): Promise<boolean> => {
    try {
      if (!selectedColumn || !selectedCategory) {
        throw new Error('Kateqoriya və ya sütun seçilməyib');
      }
      
      console.log(`[handleBulkReject] Bulk rejecting ${schoolIds.length} schools for column ${selectedColumn.name}`);
      
      // FIXED: Bulk reject only for specific column
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejected_by: user?.id,
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('column_id', selectedColumn.id)
        .in('school_id', schoolIds);
      
      if (error) {
        console.error('Bulk rejection error:', error);
        throw error;
      }
      
      console.log(`[handleBulkReject] Successfully bulk rejected ${schoolIds.length} entries for column ${selectedColumn.name}`);
      
      // Refresh data
      await loadSchoolData(selectedCategory.id, selectedColumn.id);
      return true;
    } catch (error) {
      console.error('Error bulk rejecting:', error);
      return false;
    }
  };

  // Utility functions
  const refreshData = async () => {
    if (selectedCategory) {
      await loadColumns(selectedCategory.id);
      if (selectedColumn) {
        await loadSchoolData(selectedCategory.id, selectedColumn.id);
      }
    }
    // Categories are handled by React Query automatically
  };

  const clearError = () => {
    setError(null);
  };

  // Categories are loaded via React Query automatically
  
  // Update loading state when categories loading changes
  useEffect(() => {
    setLoading(prev => ({ ...prev, categories: categoriesLoading }));
  }, [categoriesLoading]);
  
  // Update error when categories error changes
  useEffect(() => {
    if (categoriesError) {
      console.error('Categories error details:', categoriesError);
      const errorMessage = categoriesError.message || 'Kateqoriyaları yükləyərkən xəta baş verdi';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [categoriesError]);

  return {
    // State
    categories,
    columns,
    schoolData,
    stats,
    loading,
    error,
    permissions,
    currentStep,
    selectedCategory,
    selectedColumn,

    // Navigation
    goToStep,
    resetWorkflow,

    // Category selection
    handleCategorySelect,

    // Column selection  
    handleColumnSelect,

    // Data management - Updated handler signatures
    handleDataSave,
    handleDataApprove,
    handleDataReject,
    handleBulkApprove,
    handleBulkReject,

    // Utilities
    refreshData,
    clearError,
    loadColumns,
    loadSchoolData,
    saveData: handleDataSave
  };
};
