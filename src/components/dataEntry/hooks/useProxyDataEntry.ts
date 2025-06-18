import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProxyDataEntryService } from '@/services/dataEntry/proxyDataEntryService';

interface UseProxyDataEntryProps {
  schoolId: string;
  categoryId: string;
  columnId?: string;
  onComplete?: () => void;
}

export const useProxyDataEntry = ({
  schoolId,
  categoryId,
  columnId,
  onComplete
}: UseProxyDataEntryProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveAttempts, setSaveAttempts] = useState(0);
  
  const { toast } = useToast();

  // Məktəb məlumatlarını əldə et
  const { data: schoolData, isLoading: isLoadingSchool } = useQuery({
    queryKey: ['school', schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Kateqoriya məlumatlarını əldə et
  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Sütunları əldə et
  const { data: columns, isLoading: isLoadingColumns } = useQuery({
    queryKey: ['columns', categoryId, columnId],
    queryFn: async () => {
      let query = supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });
      
      if (columnId) {
        query = query.eq('id', columnId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Mövcud məlumatları əldə et
  const { data: existingEntries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['data_entries', schoolId, categoryId, columnId],
    queryFn: async () => {
      let query = supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);

      if (columnId) {
        query = query.eq('column_id', columnId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Data-nı Record<string, string> formatına çevir
      const formattedData: Record<string, string> = {};
      data?.forEach(entry => {
        formattedData[entry.column_id] = entry.value || '';
      });
      
      return formattedData;
    },
    enabled: !!schoolId && !!categoryId,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Form data-nı yüklə
  useEffect(() => {
    if (existingEntries && !isLoadingEntries) {
      setFormData(prev => {
        if (Object.keys(prev).length > 0 && hasUnsavedChanges) {
          return prev;
        }
        return existingEntries;
      });
    }
  }, [existingEntries, isLoadingEntries, hasUnsavedChanges]);

  // Auto-save funksiyası
  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveAttempts(prev => prev + 1);
    
    try {
      const result = await ProxyDataEntryService.saveProxyFormData(
        schoolId,
        categoryId,
        formData
      );

      if (result.success) {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        setSaveAttempts(0);
        toast({
          title: 'Məlumatlar yadda saxlanıldı',
          description: 'Məlumatlar müvəqqəti yadda saxlanıldı',
          variant: 'default'
        });
      } else {
        setSaveError(result.message || 'Məlumatları yadda saxlamaq mümkün olmadı');
        toast({
          title: 'Xəta',
          description: result.message || 'Məlumatları yadda saxlamaq mümkün olmadı',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setSaveError(error.message || 'Məlumatları yadda saxlamaq mümkün olmadı');
      toast({
        title: 'Xəta',
        description: error.message || 'Məlumatları yadda saxlamaq mümkün olmadı',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, schoolId, categoryId, formData, toast]);

  // Input dəyişiklik handler-i
  const handleInputChange = useCallback((columnId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [columnId]: value
    }));
    setHasUnsavedChanges(true);
    setSaveError(null);
  }, []);

  // Submit handler-i
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      // Əvvəlcə yadda saxla, sonra təqdim et
      await handleSave();

      const result = await ProxyDataEntryService.submitProxyData(
        schoolId,
        categoryId,
        formData
      );

      if (result.success) {
        toast({
          title: 'Məlumatlar təqdim edildi',
          description: 'Məlumatlar uğurla təqdim edildi və təsdiq edildi',
          variant: 'default'
        });
        
        if (onComplete) {
          onComplete();
        }
      } else {
        toast({
          title: 'Xəta',
          description: result.message || 'Məlumatları təqdim etmək mümkün olmadı',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Xəta',
        description: error.message || 'Məlumatları təqdim etmək mümkün olmadı',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [schoolId, categoryId, formData, toast, onComplete, handleSave]);

  // Error reset
  const resetError = useCallback(() => {
    setSaveError(null);
    setSaveAttempts(0);
  }, []);

  // Retry save
  const retrySave = useCallback(() => {
    handleSave();
  }, [handleSave]);

  // Auto-save effect
  useEffect(() => {
    let autoSaveInterval: NodeJS.Timeout | null = null;

    if (hasUnsavedChanges && !saveError) {
      autoSaveInterval = setInterval(() => {
        handleSave();
      }, 30000); // 30 saniyə
    }

    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [hasUnsavedChanges, handleSave, saveError]);

  const isLoading = isLoadingSchool || isLoadingCategory || isLoadingEntries || isLoadingColumns;

  return {
    // Data
    schoolData,
    categoryData,
    columns,
    formData,
    
    // States
    isLoading,
    isSubmitting,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    saveError,
    saveAttempts,
    
    // Handlers
    handleInputChange,
    handleSubmit,
    handleSave,
    resetError,
    retrySave
  };
};
