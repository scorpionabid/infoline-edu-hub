import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Sektor yaratmaq üçün interface
interface CreateSectorData {
  regionId: string;
  name: string;
  description?: string;
  status: string;
  adminEmail?: string; // Admin email əlavə edildi
  adminName?: string;  // Admin adı əlavə edildi
  adminPassword?: string; // Admin şifrəsi əlavə edildi
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
      const { data: result, error } = await supabase.functions
        .invoke('sector-operations', {
          body: { 
            action: 'create',
            name: data.name,
            description: data.description || null,
            regionId: data.regionId,
            status: data.status || 'active',
            adminEmail: data.adminEmail,
            adminName: data.adminName,
            adminPassword: data.adminPassword
          }
        });
        
      if (error) throw error;
      return result?.data?.sector;
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
