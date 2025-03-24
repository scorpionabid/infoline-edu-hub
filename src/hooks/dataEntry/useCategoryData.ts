
import { useCallback, useEffect } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface UseCategoryDataProps {
  selectedCategoryId: string | null | undefined;
  lastCategoryIdRef: React.MutableRefObject<string | null>;
  setIsLoading: (loading: boolean) => void;
  setCategories: (categories: CategoryWithColumns[]) => void;
  setCurrentCategoryIndex: (index: number) => void;
  initializeForm: (entries: CategoryEntryData[], status: 'draft' | 'submitted' | 'approved' | 'rejected') => void;
  validateForm: () => boolean;
  queryParams: URLSearchParams;
}

export const useCategoryData = ({
  selectedCategoryId,
  lastCategoryIdRef,
  setIsLoading,
  setCategories,
  setCurrentCategoryIndex,
  initializeForm,
  validateForm,
  queryParams
}: UseCategoryDataProps) => {
  const { t } = useLanguage();
  
  // Kateqoriyaları və sütunları Supabasedən yükləmək
  const loadCategoryData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Supabase sorğusu ilə kateqoriyaları əldə edirik
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });
        
      if (categoriesError) throw categoriesError;
      
      if (!categoriesData || categoriesData.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Sütunları əldə edirik
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('status', 'active')
        .order('order_index', { ascending: true });
        
      if (columnsError) throw columnsError;
      
      // Kateqoriyaları və sütunları birləşdiririk
      const categoriesWithColumns: CategoryWithColumns[] = categoriesData.map(category => {
        return {
          id: category.id,
          name: category.name,
          description: category.description || '',
          assignment: category.assignment === 'sectors' ? 'sectors' : 'all',
          deadline: category.deadline,
          status: 'active',
          priority: category.priority || 0,
          createdAt: category.created_at,
          updatedAt: category.updated_at,
          columns: columnsData.filter(column => column.category_id === category.id).map(column => ({
            id: column.id,
            categoryId: column.category_id,
            name: column.name,
            type: column.type,
            isRequired: column.is_required,
            placeholder: column.placeholder || '',
            helpText: column.help_text || '',
            order: column.order_index || 0,
            status: 'active',
            validationRules: column.validation,
            defaultValue: column.default_value || '',
            options: column.options || []
          }))
        };
      });
      
      setCategories(categoriesWithColumns);
      
      // Əgər URL-də kateqoriya ID-si varsa, onu seçirik
      if (selectedCategoryId) {
        const categoryIndex = categoriesWithColumns.findIndex(cat => cat.id === selectedCategoryId);
        if (categoryIndex !== -1) {
          lastCategoryIdRef.current = selectedCategoryId;
          setCurrentCategoryIndex(categoryIndex);
        }
      }
      
      // Məlumatları lokaldan yükləyirik
      const localFormData = localStorage.getItem('infolineFormData');
      if (localFormData) {
        try {
          const parsedData = JSON.parse(localFormData);
          initializeForm(parsedData.entries, parsedData.status);
          
          // Form validasiyası
          setTimeout(() => {
            validateForm();
          }, 500);
        } catch (err) {
          console.error('Local data parsing error:', err);
          // Xəta halında yeni boş forma yaradırıq
          const initialEntries = categoriesWithColumns.map(cat => ({
            categoryId: cat.id,
            values: [],
            isCompleted: false,
            isSubmitted: false,
            completionPercentage: 0
          }));
          
          initializeForm(initialEntries, 'draft');
        }
      } else {
        // Lokal data yoxdursa, yeni forma yaradırıq
        const initialEntries = categoriesWithColumns.map(cat => ({
          categoryId: cat.id,
          values: [],
          isCompleted: false,
          isSubmitted: false,
          completionPercentage: 0
        }));
        
        initializeForm(initialEntries, 'draft');
      }
      
      // URL-dəki statusFilter parametrinə əsasən işləyirik
      const statusFilter = queryParams.get('status');
      if (statusFilter && !selectedCategoryId) {
        // Status filtrinə uyğun ilk kateqoriyanı tapırıq
        const filteredIndex = categoriesWithColumns.findIndex(cat => {
          // Burada status filtrinə uyğun kateqoriyanı seçirik
          // Bu hissə bizim tətbiqdə bu məntiqə uyğun genişləndirilə bilər
          if (statusFilter === 'pending' && cat.status === 'pending') return true;
          if (statusFilter === 'approved' && cat.status === 'approved') return true;
          if (statusFilter === 'rejected' && cat.status === 'rejected') return true;
          if (statusFilter === 'dueSoon') {
            // Son tarix yaxınlaşırsa
            const deadline = cat.deadline ? new Date(cat.deadline) : null;
            if (deadline) {
              const today = new Date();
              const diffDays = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays <= 3;
            }
          }
          if (statusFilter === 'overdue') {
            // Son tarix keçibsə
            const deadline = cat.deadline ? new Date(cat.deadline) : null;
            if (deadline) {
              const today = new Date();
              return deadline < today;
            }
          }
          return false;
        });
        
        if (filteredIndex !== -1) {
          setCurrentCategoryIndex(filteredIndex);
          lastCategoryIdRef.current = categoriesWithColumns[filteredIndex].id;
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error(t('errorLoadingCategories'), {
        description: t('pleaseTryAgainLater')
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId, lastCategoryIdRef, setIsLoading, setCategories, setCurrentCategoryIndex, initializeForm, validateForm, queryParams, t]);
  
  return { loadCategoryData };
};
