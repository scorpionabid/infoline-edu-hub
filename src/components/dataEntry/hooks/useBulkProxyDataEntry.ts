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
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sectorId,
    staleTime: 5 * 60 * 1000
  });

  // Seçilmiş kateqoriya üzrə sütunları əldə et (yalnız aktiv sütunlar)
  const { data: columns, isLoading: isLoadingColumns, error: columnsError } = useQuery({
    queryKey: ['category-columns', selectedCategory],
    queryFn: async () => {
      console.log('Sütunları yükləməyə çalışırıq. Kateqoriya ID:', selectedCategory);
      
      try {
        // Əsas sorqu – yalnız aktiv sütunlar
        const { data, error } = await supabase
          .from('columns')
          .select('id, name, type, is_required, placeholder, help_text, default_value, options, validation, status')
          .eq('category_id', selectedCategory)
          .eq('status', 'active') // FILTER: Yalnız aktiv sütunlar
          .order('name', { ascending: true }); // Name üzrə sırala (hər zaman mövcuddur)
        
        if (error) {
          console.error('Sütunlar yüklənərkən xəta:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log(`Yüklənən aktiv sütunlar (${data.length}):`, data);
          return data;
        } else {
          console.log('Bu kateqoriya üçün aktiv sütun tapılmadı');
          return [];
        }
      } catch (err) {
        console.error('Sütun sorqusu xətası:', err);
        throw err;
      }
    },
    enabled: !!selectedCategory,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000
  });
  
  // Xəta monitorinqi və əlavə məlumat
  useEffect(() => {
    if (columnsError) {
      console.error('Sütunları yükləmə xətası:', columnsError);
    }
    
    if (selectedCategory && !isLoadingColumns && columns && columns.length === 0) {
      console.log('Kateqoriya seçilib ancaq aktiv sütunlar boşdur. Kateqoriya ID:', selectedCategory);
      
      // Kateqoriyanın mövcudluğunu yoxlayırıq
      supabase
        .from('categories')
        .select('id, name')
        .eq('id', selectedCategory)
        .then(({ data, error }) => {
          if (error) {
            console.error('Kateqoriya məlumatlarını yükləmə xətası:', error);
          } else {
            console.log('Seçilmiş kateqoriya:', data);
          }
        });
    }
  }, [selectedCategory, isLoadingColumns, columns, columnsError]);

  // Sektor üzrə məktəbləri əldə et
  const { data: schools, isLoading: isLoadingSchools } = useQuery({
    queryKey: ['sector-schools', sectorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name, code')
        .eq('sector_id', sectorId)
        .eq('status', 'active')
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
    if (!selectedCategory || !selectedColumn || selectedSchools.length === 0 || !bulkValue.trim()) {
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const results = [];
      
      // Hər məktəb üçün ayrı-ayrılıqda məlumat saxla
      for (const schoolId of selectedSchools) {
        const formData = { [selectedColumn]: bulkValue };
        
        const result = await ProxyDataEntryService.saveProxyFormData(formData, {
          categoryId: selectedCategory,
          schoolId: schoolId,
          userId: sectorId, // sector admin ID-si
          proxyUserId: sectorId,
          proxyUserRole: 'sectoradmin',
          originalSchoolId: schoolId,
          proxyReason: `Bulk data entry: ${selectedColumn} = ${bulkValue}`,
          status: 'draft'
        });
        
        results.push(result);
      }
      
      const successfulCount = results.filter(r => r.success).length;
      const failedCount = results.length - successfulCount;
      
      if (successfulCount > 0) {
        setLastSaved(new Date());
        toast({
          title: 'Məlumatlar yadda saxlanıldı',
          description: `${successfulCount} məktəb üçün məlumatlar müvəqqəti yadda saxlanıldı${failedCount > 0 ? `, ${failedCount} məktəb üçün xəta baş verdi` : ''}`,
          variant: failedCount === 0 ? 'default' : 'destructive'
        });
      } else {
        setSaveError('Heç bir məktəb üçün məlumat saxlana bilmədi');
        toast({
          title: 'Xəta',
          description: 'Heç bir məktəb üçün məlumat saxlana bilmədi',
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
  }, [selectedCategory, selectedColumn, selectedSchools, bulkValue, toast, sectorId]);

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
      
      // Hər məktəb üçün ayrı-ayrılıqda submit et
      const results = [];
      for (const schoolId of selectedSchools) {
        const result = await ProxyDataEntryService.submitProxyData({
          categoryId: selectedCategory,
          schoolId: schoolId,
          proxyUserId: sectorId, // sector admin istifadəçi ID-si
          proxyUserRole: 'sectoradmin',
          proxyReason: `Bulk data entry for column: ${selectedColumn}`,
          autoApprove: true
        });
        results.push(result);
      }
      
      const successfulCount = results.filter(r => r.success).length;
      const failedCount = results.length - successfulCount;
      
      if (successfulCount > 0) {
        toast({
          title: 'Məlumatlar təqdim edildi',
          description: `${successfulCount} məktəb üçün məlumatlar uğurla təqdim edildi${failedCount > 0 ? `, ${failedCount} məktəb üçün xəta baş verdi` : ''}`,
          variant: failedCount === 0 ? 'default' : 'destructive'
        });
        
        if (failedCount === 0 && onComplete) {
          onComplete();
        }
      } else {
        setSubmitError('Heç bir məktəb üçün məlumat təqdim edilə bilmədi');
        toast({
          title: 'Xəta',
          description: 'Heç bir məktəb üçün məlumat təqdim edilə bilmədi',
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
  }, [selectedCategory, selectedColumn, selectedSchools, bulkValue, handleBulkSave, toast, onComplete, sectorId]);

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
