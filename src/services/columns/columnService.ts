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
  } = {}): Promise<Column[]> {
    try {
      let query = supabase.from('columns').select('*');
      
      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      
      if (options.status) {
        query = query.eq('status', options.status);
      } else if (!options.includeDeleted) {
        // By default, exclude deleted columns UNLESS includeDeleted=true
        query = query.neq('status', 'deleted');
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
        // Permanent delete
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
        supabase
          .from('columns')
          .update({ order_index: index })
          .eq('id', columnId)
      );

      await Promise.all(updatePromises);
      
      toast.success('Columns reordered successfully');
      return true;
      
    } catch (error: any) {
      console.error('ColumnService.reorderColumns error:', error);
      const message = error.message || 'Error reordering columns';
      toast.error(message);
      throw error;
    }
  }
}

// Export singleton instance
export const columnService = new ColumnService();
