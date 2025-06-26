import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnFormData } from '@/types/column';
import { toast } from 'sonner';

/**
 * Unified Column Service
 * Handles all column-related database operations
 */
export class ColumnService {
  
  /**
   * Fetch columns with optional filtering
   */
  async fetchColumns(options: {
    categoryId?: string;
    status?: string;
    orderBy?: string;
    limit?: number;
    includeDeleted?: boolean; // NEW: Override exclude deleted behavior
    includeInactive?: boolean; // NEW: Include inactive columns
  } = {}): Promise<Column[]> {
    try {
      let query = supabase.from('columns').select('*');
      
      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      
      if (options.status) {
        query = query.eq('status', options.status);
      } else {
        // By default, exclude deleted and inactive columns for data entry
        const excludeStatuses = ['deleted'];
        if (!options.includeInactive) {
          excludeStatuses.push('inactive');
        }
        
        if (!options.includeDeleted) {
          // Use proper PostgreSQL 'not in' syntax
          query = query.not('status', 'in', `(${excludeStatuses.map(s => `'${s}'`).join(',')})`);
        } else if (!options.includeInactive) {
          // Include deleted but not inactive
          query = query.neq('status', 'inactive');
        }
      }
      
      const orderBy = options.orderBy || 'order_index';
      query = query.order(orderBy);
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }
      
      return (data || []) as Column[];
      
    } catch (error) {
      console.error('ColumnService.fetchColumns error:', error);
      throw error;
    }
  }

  /**
   * Create a new column
   */
  async createColumn(categoryId: string, columnData: ColumnFormData): Promise<Column> {
    try {
      // Get the highest order_index for this category
      const { data: existingColumns, error: fetchError } = await supabase
        .from('columns')
        .select('order_index')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const orderIndex = existingColumns && existingColumns.length > 0 
        ? (existingColumns[0].order_index || 0) + 1 
        : 0;

      // Prepare data for insertion
      const insertData = {
        ...columnData,
        category_id: categoryId,
        status: 'active',
        order_index: orderIndex,
        // Ensure proper serialization
        default_value: columnData.default_value ? String(columnData.default_value) : undefined,
        options: columnData.options ? JSON.stringify(columnData.options) : undefined,
        validation: columnData.validation ? JSON.stringify(columnData.validation) : undefined,
      };

      const { data, error } = await supabase
        .from('columns')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Column created successfully');
      return data as Column;
      
    } catch (error: any) {
      console.error('ColumnService.createColumn error:', error);
      const message = error.message || 'Error creating column';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Update an existing column
   */
  async updateColumn(columnId: string, columnData: Partial<ColumnFormData>): Promise<Column> {
    try {
      // Prepare data for update
      const updateData = {
        ...columnData,
        // Ensure proper serialization
        default_value: columnData.default_value !== undefined 
          ? String(columnData.default_value) 
          : undefined,
        options: columnData.options 
          ? JSON.stringify(columnData.options) 
          : undefined,
        validation: columnData.validation 
          ? JSON.stringify(columnData.validation) 
          : undefined,
      };

      const { data, error } = await supabase
        .from('columns')
        .update(updateData)
        .eq('id', columnId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Column updated successfully');
      return data as Column;
      
    } catch (error: any) {
      console.error('ColumnService.updateColumn error:', error);
      const message = error.message || 'Error updating column';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Delete a column (soft delete)
   */
  async deleteColumn(columnId: string, permanent: boolean = false): Promise<boolean> {
    try {
      if (permanent) {
        // First delete related data entries to avoid foreign key constraint
        const { error: dataDeleteError } = await supabase
          .from('data_entries')
          .delete()
          .eq('column_id', columnId);

        if (dataDeleteError) {
          console.warn('Warning deleting data entries:', dataDeleteError);
          // Continue with column deletion even if data entries deletion fails
        }

        // Then delete the column
        const { error } = await supabase
          .from('columns')
          .delete()
          .eq('id', columnId);

        if (error) throw error;
        toast.success('Column permanently deleted');
      } else {
        // Soft delete - just mark as deleted
        const { error } = await supabase
          .from('columns')
          .update({ status: 'deleted' })
          .eq('id', columnId);

        if (error) throw error;
        toast.success('Column moved to trash');
      }

      return true;
      
    } catch (error: any) {
      console.error('ColumnService.deleteColumn error:', error);
      const message = error.message || 'Error deleting column';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Restore a deleted column
   */
  async restoreColumn(columnId: string): Promise<Column> {
    try {
      const { data, error } = await supabase
        .from('columns')
        .update({ status: 'active' })
        .eq('id', columnId)
        .select()
        .single();

      if (error) throw error;

      toast.success('Column restored successfully');
      return data as Column;
      
    } catch (error: any) {
      console.error('ColumnService.restoreColumn error:', error);
      const message = error.message || 'Error restoring column';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Bulk operations
   */
  async bulkDelete(columnIds: string[], permanent: boolean = false): Promise<boolean> {
    try {
      if (permanent) {
        // First delete related data entries to avoid foreign key constraints
        const { error: dataDeleteError } = await supabase
          .from('data_entries')
          .delete()
          .in('column_id', columnIds);

        if (dataDeleteError) {
          console.warn('Warning deleting data entries:', dataDeleteError);
          // Continue with column deletion even if data entries deletion fails
        }

        // Then delete the columns
        const { error } = await supabase
          .from('columns')
          .delete()
          .in('id', columnIds);

        if (error) throw error;
        toast.success(`${columnIds.length} columns permanently deleted`);
      } else {
        const { error } = await supabase
          .from('columns')
          .update({ status: 'deleted' })
          .in('id', columnIds);

        if (error) throw error;
        toast.success(`${columnIds.length} columns moved to trash`);
      }

      return true;
      
    } catch (error: any) {
      console.error('ColumnService.bulkDelete error:', error);
      const message = error.message || 'Error in bulk delete operation';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Reorder columns
   */
  async reorderColumns(columnIds: string[]): Promise<boolean> {
    try {
      const updatePromises = columnIds.map((columnId, index) => 
        // supabase
          .from('columns')
          .update({ order_index: index })
          .eq('id', columnId)
      );

      await Promise.all(updatePromises);
      
      toast.success('Sütun sırası yeniləndi');
      return true;
      
    } catch (error: any) {
      console.error('ColumnService.reorderColumns error:', error);
      const message = error.message || 'Error reordering columns';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Duplicate a column
   */
  async duplicateColumn(columnId: string, newName?: string): Promise<Column> {
    try {
      // Get the original column
      const { data: originalColumn, error: fetchError } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();

      if (fetchError) throw fetchError;

      // Prepare duplicated data
      const { id, created_at, updated_at, ...columnData } = originalColumn;
      const duplicatedData = {
        ...columnData,
        name: newName || `${originalColumn.name} (Kopya)`,
        status: 'active',
        // Ensure proper serialization
        options: originalColumn.options || [],
        validation: originalColumn.validation || {},
      };

      return await this.createColumn(originalColumn.category_id, duplicatedData);
      
    } catch (error: any) {
      console.error('ColumnService.duplicateColumn error:', error);
      const message = error.message || 'Error duplicating column';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Bulk toggle status
   */
  async bulkToggleStatus(columnIds: string[], status: 'active' | 'inactive'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('columns')
        .update({ status })
        .in('id', columnIds);

      if (error) throw error;

      const statusText = status === 'active' ? 'aktivləşdirildi' : 'deaktivləşdirildi';
      toast.success(`${columnIds.length} sütun ${statusText}`);
      return true;
      
    } catch (error: any) {
      console.error('ColumnService.bulkToggleStatus error:', error);
      const message = error.message || 'Error in bulk status toggle';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Move columns to different category
   */
  async moveColumnsToCategory(columnIds: string[], targetCategoryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('columns')
        .update({ category_id: targetCategoryId })
        .in('id', columnIds);

      if (error) throw error;

      toast.success(`${columnIds.length} sütun yeni kateqoriyaya köçürüldü`);
      return true;
      
    } catch (error: any) {
      console.error('ColumnService.moveColumnsToCategory error:', error);
      const message = error.message || 'Error moving columns to category';
      toast.error(message);
      throw error;
    }
  }

  /**
   * Validate column dependencies
   */
  async validateColumnDependencies(columnId: string): Promise<{ isValid: boolean; issues: string[] }> {
    try {
      // Check if column has dependent data entries
      const { data: dataEntries, error: dataError } = await supabase
        .from('data_entries')
        .select('id')
        .eq('column_id', columnId)
        .limit(1);

      if (dataError) throw dataError;

      const issues: string[] = [];
      
      if (dataEntries && dataEntries.length > 0) {
        issues.push('Bu sütunda məlumat girişləri mövcuddur');
      }

      return {
        isValid: issues.length === 0,
        // issues
      };
      
    } catch (error: any) {
      console.error('ColumnService.validateColumnDependencies error:', error);
      return {
        isValid: false,
        issues: ['Asılılıq yoxlanışında xəta baş verdi']
      };
    }
  }
}

// Export singleton instance
export const columnService = new ColumnService();
