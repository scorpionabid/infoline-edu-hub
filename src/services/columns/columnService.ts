import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Column, ColumnWithStats } from '@/types/database/columns';
import { toast } from 'sonner';

type ColumnRow = Database['public']['Tables']['columns']['Row'];
type ColumnInsert = Database['public']['Tables']['columns']['Insert'];
type ColumnUpdate = Database['public']['Tables']['columns']['Update'];

export class ColumnService {
  async getColumnsByCategory(categoryId: string): Promise<Column[]> {
    try {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order', { ascending: true });

      if (error) {
        console.error("Error fetching columns:", error);
        toast.error("Sütunlar yüklənərkən xəta baş verdi.");
        return [];
      }

      if (!data) {
        console.warn("No columns found for category:", categoryId);
        return [];
      }

      return data.map(this.mapDatabaseRowToColumn);
    } catch (error) {
      console.error("Unexpected error fetching columns:", error);
      toast.error("Gözlənilməyən xəta baş verdi.");
      return [];
    }
  }

  async getColumnsWithStats(categoryId: string): Promise<ColumnWithStats[]> {
    try {
      const { data, error } = await supabase
        .from('columns')
        .select(`
          *,
          stats:column_stats(
            total,
            filled,
            empty
          )
        `)
        .eq('category_id', categoryId)
        .order('order', { ascending: true });
  
      if (error) {
        console.error("Error fetching columns with stats:", error);
        toast.error("Sütunlar statistika ilə yüklənərkən xəta baş verdi.");
        return [];
      }
  
      if (!data) {
        console.warn("No columns found for category:", categoryId);
        return [];
      }
  
      return data.map(column => ({
        ...this.mapDatabaseRowToColumn(column),
        stats: column.stats ? {
          total: column.stats.total || 0,
          filled: column.stats.filled || 0,
          empty: column.stats.empty || 0,
        } : { total: 0, filled: 0, empty: 0 },
      }));
    } catch (error) {
      console.error("Unexpected error fetching columns with stats:", error);
      toast.error("Gözlənilməyən xəta baş verdi.");
      return [];
    }
  }

  async createColumn(column: ColumnInsert): Promise<Column | null> {
    try {
      const { data, error } = await supabase
        .from('columns')
        .insert([column])
        .select('*')
        .single();

      if (error) {
        console.error("Error creating column:", error);
        toast.error("Sütun yaradılarkən xəta baş verdi.");
        return null;
      }

      if (!data) {
        console.warn("No column created.");
        return null;
      }

      return this.mapDatabaseRowToColumn(data);
    } catch (error) {
      console.error("Unexpected error creating column:", error);
      toast.error("Gözlənilməyən xəta baş verdi.");
      return null;
    }
  }

  async updateColumn(id: string, updates: ColumnUpdate): Promise<Column | null> {
    try {
      const { data, error } = await supabase
        .from('columns')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error("Error updating column:", error);
        toast.error("Sütun yenilənərkən xəta baş verdi.");
        return null;
      }

      if (!data) {
        console.warn("No column updated.");
        return null;
      }

      return this.mapDatabaseRowToColumn(data);
    } catch (error) {
      console.error("Unexpected error updating column:", error);
      toast.error("Gözlənilməyən xəta baş verdi.");
      return null;
    }
  }

  async deleteColumn(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting column:", error);
        toast.error("Sütun silinərkən xəta baş verdi.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Unexpected error deleting column:", error);
      toast.error("Gözlənilməyən xəta baş verdi.");
      return false;
    }
  }

  private mapDatabaseRowToColumn(row: ColumnRow): Column {
    return {
      id: row.id,
      name: row.name,
      type: row.type as 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'file' | 'url' | 'email' | 'phone',
      categoryId: row.category_id,
      order: row.order || 0,
      isRequired: row.is_required || false,
      isActive: row.is_active !== false,
      options: row.options ? JSON.parse(row.options) : null,
      validation: row.validation ? JSON.parse(row.validation) : null,
      description: row.description || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export const columnService = new ColumnService();
