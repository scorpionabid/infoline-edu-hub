
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
}

export interface DataManagementPermissions {
  canApprove: boolean;
  canEdit: boolean;
  canViewAll: boolean;
  role: string;
  sectorId?: string;
  regionId?: string;
}

export const useDataManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [schoolData, setSchoolData] = useState<SchoolDataEntry[]>([]);
  const [stats, setStats] = useState<DataStats>({
    totalEntries: 0,
    completedEntries: 0,
    pendingEntries: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    }
  };

  const loadColumns = async (categoryId: string) => {
    try {
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
    }
  };

  const loadSchoolData = async (categoryId: string) => {
    try {
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
    } catch (error) {
      console.error('Error loading school data:', error);
    }
  };

  const saveData = async (data: any) => {
    setSaving(true);
    try {
      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Data saved:', data);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await loadCategories();
      setLoading(false);
    };
    load();
  }, []);

  return {
    categories,
    columns,
    schoolData,
    stats,
    loading,
    saving,
    permissions,
    loadColumns,
    loadSchoolData,
    saveData,
    refreshCategories: loadCategories
  };
};
