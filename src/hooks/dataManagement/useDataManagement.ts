
import { useState, useEffect } from 'react';

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
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [error, setError] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState({
    categories: true,
    columns: false,
    schoolData: false,
    saving: false
  });

  // Mock permissions - should come from auth context
  const permissions: DataManagementPermissions = {
    canApprove: true,
    canEdit: true,
    canViewAll: true,
    role: 'sectoradmin',
    sectorId: 'sector-1',
    regionId: 'region-1'
  };

  const loadCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      // Mock data
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Ümumi Məlumatlar',
          description: 'Məktəbin ümumi məlumatları',
          assignment: 'all',
          completion_rate: 85,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Sektor Məlumatları',
          description: 'Sektor səviyyəsində məlumatlar',
          assignment: 'sectors',
          completion_rate: 60,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Kateqoriyaları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const loadColumns = async (categoryId: string) => {
    try {
      setLoading(prev => ({ ...prev, columns: true }));
      // Mock data
      const mockColumns: Column[] = [
        {
          id: '1',
          category_id: categoryId,
          name: 'Məktəb Adı',
          type: 'text',
          is_required: true,
          order_index: 1,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setColumns(mockColumns);
    } catch (error) {
      console.error('Error loading columns:', error);
      setError('Sütunları yükləyərkən xəta baş verdi');
    } finally {
      setLoading(prev => ({ ...prev, columns: false }));
    }
  };

  const loadSchoolData = async (categoryId: string) => {
    try {
      setLoading(prev => ({ ...prev, schoolData: true }));
      // Mock data
      const mockData: SchoolDataEntry[] = [
        {
          id: '1',
          school_id: 'school-1',
          school_name: 'Test Məktəbi',
          category_id: categoryId,
          column_id: '1',
          value: 'Test Məktəbi',
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setSchoolData(mockData);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalSchools: 1,
        approvedCount: 1,
        pendingCount: 0,
        rejectedCount: 0,
        emptyCount: 0,
        completionRate: 100
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
    await loadSchoolData(column.category_id);
  };

  // Data management handlers
  const handleDataSave = async (data: any) => {
    setLoading(prev => ({ ...prev, saving: true }));
    try {
      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Data saved:', data);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleDataApprove = async (entryId: string) => {
    console.log('Approving entry:', entryId);
  };

  const handleDataReject = async (entryId: string, reason: string) => {
    console.log('Rejecting entry:', entryId, reason);
  };

  const handleBulkApprove = async (entryIds: string[]) => {
    console.log('Bulk approving entries:', entryIds);
  };

  const handleBulkReject = async (entryIds: string[], reason: string) => {
    console.log('Bulk rejecting entries:', entryIds, reason);
  };

  // Utility functions
  const refreshData = async () => {
    if (selectedCategory) {
      await loadColumns(selectedCategory.id);
      if (selectedColumn) {
        await loadSchoolData(selectedCategory.id);
      }
    } else {
      await loadCategories();
    }
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    loadCategories();
  }, []);

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

    // Data management
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
    saveData: handleDataSave,
    refreshCategories: loadCategories
  };
};
