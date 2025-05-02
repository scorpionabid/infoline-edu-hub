
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category, CategoryStatus } from '@/types/category';
import { useAuth } from '@/context/auth';
import { usePermissions } from '../auth/usePermissions';

export const useCategoryActions = () => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  // Yeni kateqoriya əlavə etmək
  const addCategoryMutation = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isSuperAdmin) {
        throw new Error('Bu əməliyyat üçün SuperAdmin səlahiyyətləri tələb olunur');
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kateqoriya uğurla əlavə edildi');
    },
    onError: (error: Error) => {
      toast.error(`Xəta: ${error.message}`);
    }
  });

  // Kateqoriyanı yeniləmək
  const updateCategoryMutation = useMutation({
    mutationFn: async (category: Category) => {
      if (!isSuperAdmin) {
        throw new Error('Bu əməliyyat üçün SuperAdmin səlahiyyətləri tələb olunur');
      }

      const { id, ...updateData } = category;

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kateqoriya uğurla yeniləndi');
    },
    onError: (error: Error) => {
      toast.error(`Xəta: ${error.message}`);
    }
  });

  // Kateqoriyanı silmək
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isSuperAdmin) {
        throw new Error('Bu əməliyyat üçün SuperAdmin səlahiyyətləri tələb olunur');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kateqoriya uğurla silindi');
    },
    onError: (error: Error) => {
      toast.error(`Xəta: ${error.message}`);
    }
  });

  // Kateqoriya əlavə etmək və yeniləmək üçün vahid bir funksiya
  const handleAddCategory = async (category: Category) => {
    setIsActionLoading(true);
    try {
      if (category.id) {
        await updateCategoryMutation.mutateAsync(category);
      } else {
        await addCategoryMutation.mutateAsync(category as any);
      }
      setIsActionLoading(false);
      return true;
    } catch (error) {
      setIsActionLoading(false);
      return false;
    }
  };

  // Kateqoriyanı silmək üçün handler
  const handleDeleteCategory = async (id: string) => {
    setIsActionLoading(true);
    try {
      await deleteCategoryMutation.mutateAsync(id);
      setIsActionLoading(false);
      return true;
    } catch (error) {
      setIsActionLoading(false);
      return false;
    }
  };

  // Kateqoriyanın statusunu dəyişmək üçün handler
  const handleUpdateCategoryStatus = async (id: string, status: CategoryStatus) => {
    setIsActionLoading(true);
    try {
      await updateCategoryMutation.mutateAsync({
        id,
        status
      } as Category);
      setIsActionLoading(false);
      return true;
    } catch (error) {
      setIsActionLoading(false);
      return false;
    }
  };

  return {
    isActionLoading,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus
  };
};

export default useCategoryActions;
