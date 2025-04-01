
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Sektor yaratmaq üçün interface
interface CreateSectorData {
  regionId: string;
  name: string;
  description?: string;
  status: string;
}

// Sektor yeniləmək üçün interface
interface EditSectorData {
  id: string;
  name: string;
  description?: string;
  status: string;
}

// Sektor yaratmaq üçün mutation
export const useCreateSector = () => {
  return useMutation({
    mutationFn: async (data: CreateSectorData) => {
      const { data: result, error } = await supabase
        .from('sectors')
        .insert({
          name: data.name,
          description: data.description || null,
          region_id: data.regionId,
          status: data.status || 'active'
        })
        .select()
        .single();
        
      if (error) throw error;
      return result;
    }
  });
};

// Sektor yeniləmək üçün mutation
export const useEditSector = () => {
  return useMutation({
    mutationFn: async (data: EditSectorData) => {
      const { data: result, error } = await supabase
        .from('sectors')
        .update({
          name: data.name,
          description: data.description || null,
          status: data.status || 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();
        
      if (error) throw error;
      return result;
    }
  });
};

// Sektor silmək üçün mutation
export const useDeleteSector = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    }
  });
};
