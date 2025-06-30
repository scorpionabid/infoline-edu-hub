
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/auth/useUser';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import type { Category, Column } from '@/types/column';

export interface DataManagementPermissions {
  canEdit: boolean;
  canApprove: boolean;
}

export const useDataManagement = () => {
  const { user, session } = useUser();
  const userId = user?.id;
  const userRole = user?.user_metadata?.role as string;
  const [currentStep, setCurrentStep] = useState<'category' | 'column' | 'data'>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [schoolData, setSchoolData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Determine user permissions - RESTORED: SectorAdmin can edit
  const permissions: DataManagementPermissions = {
    canEdit: true, // All users can edit (including sectoradmin)
    canApprove: ['regionadmin', 'superadmin', 'sectoradmin'].includes(userRole),
  };

  // Load school data for specific category and column
  const loadSchoolData = async (categoryId: string, columnId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading school data for:', { categoryId, columnId });

      const { data, error } = await supabase
        .from('school_data_entries')
        .select(`
          *,
          schools!school_data_entries_school_id_fkey (
            id,
            name
          )
        `)
        .eq('category_id', categoryId)
        .eq('column_id', columnId);

      if (error) {
        console.error('Error loading school data:', error);
        throw error;
      }

      if (!data) {
        setSchoolData([]);
        return;
      }

      // Transform data for UI
      const transformedData: SchoolDataEntry[] = data.map(entry => ({
        id: entry.id,
        school_id: entry.school_id,
        school_name: entry.schools?.name || 'Naməlum məktəb',
        category_id: entry.category_id,
        column_id: entry.column_id,
        value: entry.column_data?.[columnId] || '',
        status: entry.status || 'empty',
        created_at: entry.created_at,
        updated_at: entry.updated_at
      }));

      console.log('Transformed school data:', transformedData);
      setSchoolData(transformedData);

    } catch (error) {
      console.error('Failed to load school data:', error);
      setError('Məktəb məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Save data - RESTORED: SectorAdmin can save data on behalf of schools
  const handleDataSave = async (schoolId: string, value: string): Promise<boolean> => {
    // Check if user can edit data
    if (!permissions.canEdit) {
      toast.error('Məlumat redaktə etmək üçün icazəniz yoxdur');
      return false;
    }

    try {
      setSaving(true);

      if (!selectedCategory?.id || !selectedColumn?.id) {
        toast.error('Kateqoriya və ya sütun seçilməyib');
        return false;
      }

      console.log('Saving data:', { schoolId, columnId: selectedColumn.id, value });

      // Check if entry exists
      const { data: existingEntry } = await supabase
        .from('school_data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', selectedCategory.id)
        .eq('column_id', selectedColumn.id)
        .single();

      const columnData = { [selectedColumn.id]: value };

      let result;
      if (existingEntry) {
        // Update existing entry
        result = await supabase
          .from('school_data_entries')
          .update({
            column_data: columnData,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id);
      } else {
        // Create new entry
        result = await supabase
          .from('school_data_entries')
          .insert({
            school_id: schoolId,
            category_id: selectedCategory.id,
            column_id: selectedColumn.id,
            column_data: columnData,
            status: 'pending'
          });
      }

      if (result.error) {
        console.error('Save error:', result.error);
        throw result.error;
      }

      // Reload data to reflect changes
      await loadSchoolData(selectedCategory.id, selectedColumn.id);
      
      console.log('Data saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Approve data - FIXED: Column-level approval only
  const handleDataApprove = async (schoolId: string, comment?: string): Promise<boolean> => {
    if (!permissions.canApprove) {
      toast.error('Təsdiq etmək üçün icazəniz yoxdur');
      return false;
    }

    if (!selectedColumn?.id) {
      toast.error('Sütun seçilməyib');
      return false;
    }

    try {
      setSaving(true);
      console.log('Approving data for school:', schoolId, 'column:', selectedColumn.id);

      // FIXED: Only approve the specific column data
      const { error } = await supabase
        .from('school_data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userId,
          approval_comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('column_id', selectedColumn.id); // COLUMN-SPECIFIC FILTER

      if (error) {
        console.error('Approve error:', error);
        throw error;
      }

      // Reload data to reflect changes
      if (selectedCategory?.id) {
        await loadSchoolData(selectedCategory.id, selectedColumn.id);
      }
      
      console.log('Data approved successfully for column:', selectedColumn.name);
      return true;
    } catch (error) {
      console.error('Failed to approve data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Reject data - FIXED: Column-level rejection only
  const handleDataReject = async (schoolId: string, reason: string, comment?: string): Promise<boolean> => {
    if (!permissions.canApprove) {
      toast.error('Rədd etmək üçün icazəniz yoxdur');
      return false;
    }

    if (!selectedColumn?.id) {
      toast.error('Sütun seçilməyib');
      return false;
    }

    try {
      setSaving(true);
      console.log('Rejecting data for school:', schoolId, 'column:', selectedColumn.id);

      // FIXED: Only reject the specific column data
      const { error } = await supabase
        .from('school_data_entries')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: userId,
          rejection_reason: reason,
          rejection_comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
        .eq('column_id', selectedColumn.id); // COLUMN-SPECIFIC FILTER

      if (error) {
        console.error('Reject error:', error);
        throw error;
      }

      // Reload data to reflect changes
      if (selectedCategory?.id) {
        await loadSchoolData(selectedCategory.id, selectedColumn.id);
      }
      
      console.log('Data rejected successfully for column:', selectedColumn.name);
      return true;
    } catch (error) {
      console.error('Failed to reject data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Bulk approve - FIXED: Column-level bulk operations
  const handleBulkApprove = async (schoolIds: string[]): Promise<boolean> => {
    if (!permissions.canApprove) {
      toast.error('Toplu təsdiq üçün icazəniz yoxdur');
      return false;
    }

    if (!selectedColumn?.id) {
      toast.error('Sütun seçilməyib');
      return false;
    }

    try {
      setSaving(true);
      console.log('Bulk approving data for schools:', schoolIds, 'column:', selectedColumn.id);

      // FIXED: Only approve the specific column data for selected schools
      const { error } = await supabase
        .from('school_data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('column_id', selectedColumn.id) // COLUMN-SPECIFIC FILTER
        .in('school_id', schoolIds);

      if (error) {
        console.error('Bulk approve error:', error);
        throw error;
      }

      // Reload data to reflect changes
      if (selectedCategory?.id) {
        await loadSchoolData(selectedCategory.id, selectedColumn.id);
      }
      
      console.log('Bulk approval successful for column:', selectedColumn.name);
      return true;
    } catch (error) {
      console.error('Failed to bulk approve data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Bulk reject - FIXED: Column-level bulk operations
  const handleBulkReject = async (schoolIds: string[], reason: string): Promise<boolean> => {
    if (!permissions.canApprove) {
      toast.error('Toplu rədd üçün icazəniz yoxdur');
      return false;
    }

    if (!selectedColumn?.id) {
      toast.error('Sütun seçilməyib');
      return false;
    }

    try {
      setSaving(true);
      console.log('Bulk rejecting data for schools:', schoolIds, 'column:', selectedColumn.id);

      // FIXED: Only reject the specific column data for selected schools
      const { error } = await supabase
        .from('school_data_entries')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: userId,
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('column_id', selectedColumn.id) // COLUMN-SPECIFIC FILTER
        .in('school_id', schoolIds);

      if (error) {
        console.error('Bulk reject error:', error);
        throw error;
      }

      // Reload data to reflect changes
      if (selectedCategory?.id) {
        await loadSchoolData(selectedCategory.id, selectedColumn.id);
      }
      
      console.log('Bulk rejection successful for column:', selectedColumn.name);
      return true;
    } catch (error) {
      console.error('Failed to bulk reject data:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goToNextStep = () => {
    switch (currentStep) {
      case 'category':
        if (selectedCategory) {
          setCurrentStep('column');
        }
        break;
      case 'column':
        if (selectedColumn) {
          setCurrentStep('data');
        }
        break;
      default:
        break;
    }
  };

  const goToPrevStep = () => {
    switch (currentStep) {
      case 'column':
        setCurrentStep('category');
        break;
      case 'data':
        setCurrentStep('column');
        break;
      default:
        break;
    }
  };

  const resetSteps = () => {
    setCurrentStep('category');
    setSelectedCategory(null);
    setSelectedColumn(null);
    setSchoolData([]);
  };

  return {
    currentStep,
    selectedCategory,
    selectedColumn,
    schoolData,
    loading,
    saving,
    error,
    permissions,
    setCurrentStep,
    setSelectedCategory,
    setSelectedColumn,
    loadSchoolData,
    handleDataSave,
    handleDataApprove,
    handleDataReject,
    handleBulkApprove,
    handleBulkReject,
    goToNextStep,
    goToPrevStep,
    resetSteps
  };
};

// Define missing types locally since they're not available from useDataManagement
export type DataManagementStep = 'category' | 'column' | 'data';

export type SchoolDataEntry = {
  id: string;
  school_id: string;
  school_name: string;
  category_id: string;
	column_id: string;
  value: string;
  status: 'empty' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type DataStats = {
  totalSchools: number;
  pendingCount: number;
  approvedCount: number;
  completionRate: number;
};
