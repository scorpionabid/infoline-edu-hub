
import { useCallback, MutableRefObject, useRef } from 'react';
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
      // Demo kateqoriyalar - əgər mockCategories boşdursa və ya az elementimlərə malikdirsə, demo əlavə edirik
      const demoCategories: CategoryWithColumns[] = [
        {
          id: "demo1",
          name: "İnfrastruktur",
          description: "Məktəbin infrastruktur məlumatları",
          type: "school",
          status: "active",
          deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
          createdAt: new Date().toISOString(),
          columns: [
            {
              id: "demo-col1",
              categoryId: "demo1",
              name: "Binanın vəziyyəti",
              type: "select",
              isRequired: true,
              options: ["Əla", "Yaxşı", "Qənaətbəxş", "Təmir tələb edir"],
              placeholder: "Binanın vəziyyətini seçin",
              helpText: "Məktəb binasının ümumi vəziyyətini seçin",
              order: 1,
              status: "active"
            },
            {
              id: "demo-col2",
              categoryId: "demo1",
              name: "Son təmir tarixi",
              type: "date",
              isRequired: true,
              placeholder: "Son təmir tarixini seçin",
              helpText: "Məktəbdə aparılan son təmir işlərinin tarixini qeyd edin",
              order: 2,
              status: "active"
            },
            {
              id: "demo-col3",
              categoryId: "demo1",
              name: "Sinif otaqlarının sayı",
              type: "number",
              isRequired: true,
              validationRules: {
                minValue: 1,
                maxValue: 100
              },
              placeholder: "Sinif otaqlarının sayını daxil edin",
              helpText: "Məktəbdəki ümumi sinif otaqlarının sayını daxil edin",
              order: 3,
              status: "active"
            }
          ]
        },
        {
          id: "demo2",
          name: "Tədris məlumatları",
          description: "Məktəbin tədris prosesi ilə bağlı məlumatlar",
          type: "school",
          status: "active",
          deadline: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
          createdAt: new Date().toISOString(),
          columns: [
            {
              id: "demo-col4",
              categoryId: "demo2",
              name: "Tədris dili",
              type: "select",
              isRequired: true,
              options: ["Azərbaycan", "Rus", "İngilis", "Qarışıq"],
              placeholder: "Tədris dilini seçin",
              helpText: "Məktəbin əsas tədris dilini seçin",
              order: 1,
              status: "active"
            },
            {
              id: "demo-col5",
              categoryId: "demo2",
              name: "Həftəlik dərs saatları",
              type: "number",
              isRequired: true,
              validationRules: {
                minValue: 20,
                maxValue: 40
              },
              placeholder: "Həftəlik dərs saatlarını daxil edin",
              helpText: "Bir həftə ərzində keçirilən ümumi dərs saatlarını daxil edin",
              order: 2,
              status: "active"
            },
            {
              id: "demo-col6",
              categoryId: "demo2",
              name: "Əlavə təhsil proqramları",
              type: "text",
              multiline: true,
              isRequired: false,
              placeholder: "Əlavə təhsil proqramlarını daxil edin",
              helpText: "Məktəbdə tətbiq edilən əlavə təhsil proqramlarını təsvir edin",
              order: 3,
              status: "active"
            }
          ]
        }
      ];
      
      // Mövcud kateqoriyaları və demo kateqoriyaları birləşdiririk
      const combinedCategories = [...mockCategories];
      
      // Əgər mövcud kateqoriyalar 2-dən azdırsa, demo kateqoriyaları əlavə edirik
      if (mockCategories.length < 2) {
        combinedCategories.push(...demoCategories);
      }
      
      // Yeni əlavə olunmuş kateqoriyaları və yaxın müddəti olan kateqoriyaları öndə göstərmək
      const sortedCategories = [...combinedCategories].sort((a, b) => {
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
      
      console.log(`Yüklənmiş kateqoriyalar:`, sortedCategories);
      setCategories(sortedCategories);
      
      // Konkret kateqoriya ID-si verilibsə, həmin kateqoriyaya keçirik
      if (selectedCategoryId) {
        const categoryIndex = sortedCategories.findIndex(cat => cat.id === selectedCategoryId);
        if (categoryIndex !== -1) {
          console.log(`Seçilmiş kateqoriya indeksi: ${categoryIndex}`);
          setCurrentCategoryIndex(categoryIndex);
        } else {
          console.log(`Seçilmiş kateqoriya ID (${selectedCategoryId}) tapılmadı, ilk kateqoriyaya keçirilir`);
          setCurrentCategoryIndex(0);
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
          console.log(`Təcili kateqoriya indeksi: ${overdueOrUrgentCategoryIndex}`);
          setCurrentCategoryIndex(overdueOrUrgentCategoryIndex);
        } else {
          console.log(`Təcili kateqoriya tapılmadı, ilk kateqoriyaya keçirilir`);
          setCurrentCategoryIndex(0);
        }
      }

      // İlkin məlumatlar (LocalStorage-də mövcud deyilsə)
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
