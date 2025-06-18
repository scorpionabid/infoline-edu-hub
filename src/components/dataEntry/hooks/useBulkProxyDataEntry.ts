import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProxyDataEntryService } from '@/services/dataEntry/proxyDataEntryService';

interface UseBulkProxyDataEntryProps {
  sectorId: string;
  onComplete?: () => void;
}

export const useBulkProxyDataEntry = ({ 
  sectorId,
  onComplete
}: UseBulkProxyDataEntryProps) => {
  // Process state
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [bulkValue, setBulkValue] = useState<string>('');
  
  // Operation state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { toast } = useToast();

  // Əgər addımlardan biri dəyişsə, xəta mesajlarını sıfırla
  useEffect(() => {
    setSaveError(null);
    setSubmitError(null);
  }, [step, selectedCategory, selectedColumn, selectedSchools, bulkValue]);

  // Sektor üzrə olan kateqoriyaları əldə et
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['sector-categories', sectorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sectorId,
    staleTime: 5 * 60 * 1000
  });

  // Seçilmiş kateqoriya üzrə sütunları əldə et
  const { data: columns, isLoading: isLoadingColumns } = useQuery({
    queryKey: ['category-columns', selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('columns')
        .select('id, name, description, type, options')
        .eq('category_id', selectedCategory)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCategory,
    staleTime: 5 * 60 * 1000
  });

  // Sektor üzrə məktəbləri əldə et
  const { data: schools, isLoading: isLoadingSchools } = useQuery({
    queryKey: ['sector-schools', sectorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, code')
        .eq('sector_id', sectorId)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sectorId,
    staleTime: 5 * 60 * 1000
  });

  // Addımı artır
  const nextStep = useCallback(() => {
    if ((step === 1 && !selectedCategory) || 
        (step === 2 && !selectedColumn) || 
        (step === 3 && selectedSchools.length === 0)) {
      return;
    }
    setStep(prev => Math.min(prev + 1, 4));
  }, [step, selectedCategory, selectedColumn, selectedSchools]);

  // Addımı azalt
  const previousStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Topluca yaddaşda saxla
  const handleBulkSave = useCallback(async () => {
    if (!selectedCategory || !selectedColumn || selectedSchools.length === 0) {
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const result = await ProxyDataEntryService.bulkSaveProxyFormData(
        selectedSchools,
        selectedCategory,
        selectedColumn,
        bulkValue
      );
      
      if (result.success) {
        setLastSaved(new Date());
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
  }, [selectedCategory, selectedColumn, selectedSchools, bulkValue, toast]);

  // Topluca təqdim et
  const handleBulkSubmit = useCallback(async () => {
    if (!selectedCategory || !selectedColumn || selectedSchools.length === 0) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Əvvəlcə yadda saxla
      await handleBulkSave();
      
      const result = await ProxyDataEntryService.bulkSubmitProxyData(
        selectedSchools,
        selectedCategory,
        selectedColumn,
        bulkValue
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
        setSubmitError(result.message || 'Məlumatları təqdim etmək mümkün olmadı');
        toast({
          title: 'Xəta',
          description: result.message || 'Məlumatları təqdim etmək mümkün olmadı',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      setSubmitError(error.message || 'Məlumatları təqdim etmək mümkün olmadı');
      toast({
        title: 'Xəta',
        description: error.message || 'Məlumatları təqdim etmək mümkün olmadı',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCategory, selectedColumn, selectedSchools, bulkValue, handleBulkSave, toast, onComplete]);

  return {
    // Data
    categories,
    columns,
    schools,
    
    // Selection state
    step,
    selectedCategory,
    selectedColumn,
    selectedSchools,
    bulkValue,
    
    // Loading states
    isLoadingCategories,
    isLoadingColumns,
    isLoadingSchools,
    isSaving,
    isSubmitting,
    
    // Error states
    saveError,
    submitError,
    lastSaved,
    
    // Step handlers
    nextStep,
    previousStep,
    
    // Selection handlers
    setSelectedCategory,
    setSelectedColumn,
    setSelectedSchools,
    setBulkValue,
    
    // Action handlers
    handleBulkSave,
    handleBulkSubmit
  };
};
