
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataEntryService } from '@/services/dataEntry';

export interface CreateDataEntryData {
  school_id: string;
  category_id: string;
  entries: Array<{
    column_id: string;
    value: string;
  }>;
  status: 'draft' | 'pending';
}

export interface UpdateDataEntryData extends CreateDataEntryData {
  id: string;
}

export const useDataEntryOperations = () => {
  const queryClient = useQueryClient();

  const createDataEntryMutation = useMutation({
    mutationFn: async (data: CreateDataEntryData) => {
      const formData = data.entries.reduce((acc, entry) => {
        acc[entry.column_id] = entry.value;
        return acc;
      }, {} as Record<string, any>);

      return DataEntryService.saveFormData(formData, {
        categoryId: data.category_id,
        schoolId: data.school_id,
        status: data.status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-entries'] });
      toast.success('Məlumatlar uğurla saxlanıldı');
    },
    onError: (error: Error) => {
      console.error('Error creating data entry:', error);
      toast.error('Məlumat saxlanılarkən xəta baş verdi');
    }
  });

  const updateDataEntryMutation = useMutation({
    mutationFn: async (data: UpdateDataEntryData) => {
      const formData = data.entries.reduce((acc, entry) => {
        acc[entry.column_id] = entry.value;
        return acc;
      }, {} as Record<string, any>);

      return DataEntryService.saveFormData(formData, {
        categoryId: data.category_id,
        schoolId: data.school_id,
        status: data.status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-entries'] });
      toast.success('Məlumatlar uğurla yeniləndi');
    },
    onError: (error: Error) => {
      console.error('Error updating data entry:', error);
      toast.error('Məlumat yenilənərkən xəta baş verdi');
    }
  });

  return {
    createDataEntry: createDataEntryMutation.mutate,
    updateDataEntry: updateDataEntryMutation.mutate,
    isCreating: createDataEntryMutation.isPending,
    isUpdating: updateDataEntryMutation.isPending,
    createError: createDataEntryMutation.error,
    updateError: updateDataEntryMutation.error
  };
};
