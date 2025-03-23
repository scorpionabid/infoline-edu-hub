
import { useCallback, MutableRefObject } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import { mockCategories, getDefaultValueByType } from '@/data/mockCategories';

interface UseCategoryDataProps {
  selectedCategoryId: string | null;
  lastCategoryIdRef: MutableRefObject<string | null>;
  setIsLoading: (isLoading: boolean) => void;
  setCategories: (categories: CategoryWithColumns[]) => void;
  setCurrentCategoryIndex: (index: number) => void;
  initializeForm: (entries: CategoryEntryData[], status: 'draft' | 'submitted' | 'approved' | 'rejected') => void;
  validateForm: () => void;
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
  
  const loadCategoryData = useCallback(() => {
    // URL-də kateqoriya dəyişibsə yükləməni yenidən başladırıq
    if (selectedCategoryId !== lastCategoryIdRef.current) {
      setIsLoading(true);
      lastCategoryIdRef.current = selectedCategoryId;
    }
    
    // Yükləmə simulyasiyası
    const loadTimer = setTimeout(() => {
      // Yeni əlavə olunmuş kateqoriyaları və yaxın müddəti olan kateqoriyaları öndə göstərmək
      const sortedCategories = [...mockCategories].sort((a, b) => {
        // Əvvəlcə deadline-a görə sıralama
        if (a.deadline && b.deadline) {
          const deadlineA = new Date(a.deadline);
          const deadlineB = new Date(b.deadline);
          return deadlineA.getTime() - deadlineB.getTime();
        } else if (a.deadline) {
          return -1; // a-nın deadline-ı var, öndə olmalıdır
        } else if (b.deadline) {
          return 1; // b-nin deadline-ı var, öndə olmalıdır
        }
        return 0;
      });
      
      setCategories(sortedCategories);
      
      // Konkret kateqoriya ID-si verilibsə, həmin kateqoriyaya keçirik
      if (selectedCategoryId) {
        const categoryIndex = sortedCategories.findIndex(cat => cat.id === selectedCategoryId);
        if (categoryIndex !== -1) {
          setCurrentCategoryIndex(categoryIndex);
        }
      } else {
        // Vaxtı keçən və ya yaxınlaşan kategorya varsa, ona fokuslanmaq
        const now = new Date();
        const threeDaysLater = new Date(now);
        threeDaysLater.setDate(now.getDate() + 3);

        const overdueOrUrgentCategoryIndex = sortedCategories.findIndex(category => {
          if (!category.deadline) return false;
          const deadlineDate = new Date(category.deadline);
          return deadlineDate <= threeDaysLater;
        });

        if (overdueOrUrgentCategoryIndex !== -1) {
          setCurrentCategoryIndex(overdueOrUrgentCategoryIndex);
        }
      }

      // Real vəziyyətdə burada API-dən məlumatlar yüklənə bilər
      const initialEntries: CategoryEntryData[] = sortedCategories.map(category => ({
        categoryId: category.id,
        values: category.columns.map(column => ({
          columnId: column.id,
          value: getDefaultValueByType(column.type, column.defaultValue),
          status: 'pending'
        })),
        isCompleted: false,
        isSubmitted: false,
        completionPercentage: 0,
        approvalStatus: 'pending'
      }));

      // URL-dan gələn status parametrini yoxlayırıq
      const statusParam = queryParams.get('status');
      let formStatus: 'draft' | 'submitted' | 'approved' | 'rejected' = 'draft';
      
      if (statusParam === 'submitted') {
        formStatus = 'submitted';
        // Bütün entries-ləri submitted edirik
        initialEntries.forEach(entry => {
          entry.isSubmitted = true;
        });
      } else if (statusParam === 'approved') {
        formStatus = 'approved';
        // Bütün entries-ləri approved edirik
        initialEntries.forEach(entry => {
          entry.isSubmitted = true;
          entry.approvalStatus = 'approved';
        });
      } else if (statusParam === 'rejected') {
        formStatus = 'rejected';
        // Bütün entries-ləri rejected edirik
        initialEntries.forEach(entry => {
          entry.isSubmitted = true;
          entry.approvalStatus = 'rejected';
          
          // Random xəta mesajları əlavə edirik (real mühitdə API-dən gələcək)
          if (entry.values.length > 0) {
            const randomValueIndex = Math.floor(Math.random() * entry.values.length);
            entry.values[randomValueIndex].errorMessage = "Bu dəyər uyğun deyil, zəhmət olmasa yenidən yoxlayın";
          }
        });
      }

      initializeForm(initialEntries, formStatus);
      
      // Məlumatları yüklədikdən sonra validasiyanı işə salaq
      setTimeout(() => {
        validateForm();
        setIsLoading(false);
      }, 300);
      
      // Konsol log məlumatı
      console.log("Forma məlumatları yükləndi");
    }, 800);
    
    return () => {
      clearTimeout(loadTimer);
    };
  }, [selectedCategoryId, lastCategoryIdRef, setIsLoading, setCategories, setCurrentCategoryIndex, initializeForm, validateForm, queryParams]);

  return { loadCategoryData };
};
