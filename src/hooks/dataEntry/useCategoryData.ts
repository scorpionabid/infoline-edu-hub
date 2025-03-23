
import { useCallback, MutableRefObject, useRef } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';
import { mockCategories } from '@/data/mockCategories';
import { 
  getFormStatusFromParams, 
  prepareEntriesBasedOnStatus, 
  findCategoryIndex, 
  findUrgentCategoryIndex 
} from '@/utils/dataEntry/categoryUtils';
import { 
  sortCategories, 
  combineWithDemoCategories 
} from '@/utils/dataEntry/sortAndFilterUtils';
import { 
  createInitialEntries 
} from '@/utils/dataEntry/createDemoCategory';

interface UseCategoryDataProps {
  selectedCategoryId: string | null;
  lastCategoryIdRef: MutableRefObject<string | null>;
  setIsLoading: (isLoading: boolean) => void;
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
  // Bir dəfə log göstərmək üçün ref
  const hasLoggedRef = useRef<boolean>(false);
  
  const loadCategoryData = useCallback(() => {
    // URL-də kateqoriya dəyişibsə yükləməyi yenidən başladırıq
    if (selectedCategoryId !== lastCategoryIdRef.current) {
      setIsLoading(true);
      lastCategoryIdRef.current = selectedCategoryId;
      console.log(`Kateqoriya ID dəyişdi: ${selectedCategoryId}`);
    }
    
    // Yükləmə simulyasiyası
    const loadTimer = setTimeout(() => {
      // 1. Mövcud kateqoriyaları demo ilə birləşdiririk
      const combinedCategories = combineWithDemoCategories(mockCategories);
      
      // 2. Deadline-a görə sıralayırıq
      const sortedCategories = sortCategories(combinedCategories);
      
      console.log(`Yüklənmiş kateqoriyalar:`, sortedCategories);
      setCategories(sortedCategories);
      
      // 3. Kateqoriya indeksini təyin edirik
      if (selectedCategoryId) {
        const categoryIndex = findCategoryIndex(sortedCategories, selectedCategoryId);
        console.log(`Seçilmiş kateqoriya indeksi: ${categoryIndex}`);
        setCurrentCategoryIndex(categoryIndex);
      } else {
        // Vaxtı keçən və ya yaxınlaşan kategorya varsa, ona fokuslanmaq
        const urgentCategoryIndex = findUrgentCategoryIndex(sortedCategories);
        console.log(`Təcili kateqoriya indeksi: ${urgentCategoryIndex}`);
        setCurrentCategoryIndex(urgentCategoryIndex);
      }

      // 4. İlkin məlumatları hazırlayırıq
      const initialEntries = createInitialEntries(sortedCategories);
      
      // 5. URL-dan status parametrini alıb məlumatları hazırlayırıq
      const formStatus = getFormStatusFromParams(queryParams);
      const preparedEntries = prepareEntriesBasedOnStatus(initialEntries, formStatus);
      
      // 6. Formu inisializasiya edirik
      initializeForm(preparedEntries, formStatus);
      
      // 7. Məlumatları yüklədikdən sonra validasiyanı işə salırıq
      setTimeout(() => {
        validateForm();
        setIsLoading(false);
      }, 300);
      
      // Sadəcə bir dəfə konsola məlumat yazırıq, hər dəfə yox
      if (!hasLoggedRef.current) {
        console.log("Forma məlumatları yükləndi");
        hasLoggedRef.current = true;
      }
    }, 800);
    
    return () => {
      clearTimeout(loadTimer);
    };
  }, [selectedCategoryId, lastCategoryIdRef, setIsLoading, setCategories, setCurrentCategoryIndex, initializeForm, validateForm, queryParams]);

  return { loadCategoryData };
};
