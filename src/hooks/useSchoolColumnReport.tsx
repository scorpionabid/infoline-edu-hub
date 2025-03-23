
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { CategoryWithColumns } from '@/types/column';
import { SchoolColumnData, CategoryColumn } from '@/types/report';
import { mockSchools } from '@/data/schoolsData';
import { toast } from '@/components/ui/use-toast';

// Mock data generator
const generateMockSchoolColumnData = (
  categoryId: string, 
  columns: CategoryColumn[]
): SchoolColumnData[] => {
  return mockSchools.map(school => {
    return {
      schoolId: school.id,
      schoolName: school.name,
      columnData: columns.map(column => {
        // Simple random value generation based on column type
        let value: string | number | boolean | null = null;
        
        switch (column.type) {
          case 'number':
            value = Math.floor(Math.random() * 1000);
            break;
          case 'text':
            const options = ['Yaxşı', 'Orta', 'Əla', 'Kafi', 'Qeyri-kafi'];
            value = options[Math.floor(Math.random() * options.length)];
            break;
          case 'checkbox':
            value = Math.random() > 0.5;
            break;
          default:
            value = `Dəyər ${column.name}`;
        }
        
        return {
          columnId: column.id,
          value
        };
      })
    };
  });
};

// Mock API çağırışı
const fetchCategoriesWithColumns = async (): Promise<CategoryWithColumns[]> => {
  // Bu hissədə həqiqi API çağırışı olmalıdır
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          name: "Təcili məlumatlar",
          assignment: "All",
          priority: 1,
          description: "Təcili şəkildə toplanması tələb olunan məlumatlar",
          status: "active",
          columns: [
            { id: "c1", name: "Şagird sayı", type: "number", isRequired: true },
            { id: "c2", name: "Müəllim sayı", type: "number", isRequired: true },
            { id: "c3", name: "Sinif sayı", type: "number", isRequired: true }
          ]
        },
        {
          id: "2",
          name: "Tədris",
          assignment: "All",
          priority: 2,
          description: "Tədris prosesi haqqında məlumatlar",
          status: "active",
          columns: [
            { id: "c4", name: "Dərs saatı", type: "number", isRequired: true },
            { id: "c5", name: "Fənn sayı", type: "number", isRequired: false },
            { id: "c6", name: "Təhsil keyfiyyəti", type: "text", isRequired: false }
          ]
        },
        {
          id: "3",
          name: "İnfrastruktur",
          assignment: "Sectors",
          priority: 3,
          description: "Məktəb infrastrukturu haqqında məlumatlar",
          status: "active",
          columns: [
            { id: "c7", name: "Bina sahəsi", type: "number", isRequired: true },
            { id: "c8", name: "Kompüter sayı", type: "number", isRequired: true },
            { id: "c9", name: "İnternet mövcudluğu", type: "checkbox", isRequired: true }
          ]
        },
        {
          id: "4",
          name: "Davamiyyət",
          assignment: "All",
          priority: 4,
          description: "Şagird davamiyyəti haqqında məlumatlar",
          status: "active",
          columns: [
            { id: "c10", name: "Ümumi davamiyyət %", type: "number", isRequired: true },
            { id: "c11", name: "Dərsə gecikənlər", type: "number", isRequired: false },
            { id: "c12", name: "Buraxılan günlər", type: "number", isRequired: true }
          ]
        },
        {
          id: "5",
          name: "Nailiyyət",
          assignment: "Sectors",
          priority: 5,
          description: "Şagird nailiyyətləri haqqında məlumatlar",
          status: "active",
          columns: [
            { id: "c13", name: "Olimpiada iştirakçıları", type: "number", isRequired: false },
            { id: "c14", name: "Orta bal", type: "number", isRequired: true },
            { id: "c15", name: "Ali məktəbə qəbul %", type: "number", isRequired: true }
          ]
        }
      ]);
    }, 500);
  });
};

// Mock data əldə etmə
const fetchSchoolColumnData = async (
  categoryId: string,
  columns: CategoryColumn[]
): Promise<SchoolColumnData[]> => {
  // Bu hissədə həqiqi API çağırışı olmalıdır
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockSchoolColumnData(categoryId, columns));
    }, 800);
  });
};

export const useSchoolColumnReport = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [schoolColumnData, setSchoolColumnData] = useState<SchoolColumnData[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Kateqoriyaları əldə etmək
  const { 
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError
  } = useQuery({
    queryKey: ["categories-with-columns"],
    queryFn: fetchCategoriesWithColumns,
  });

  // Seçilmiş kateqoriya məlumatlarını əldə etmək
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      if (selectedCategory) {
        setIsDataLoading(true);
        
        fetchSchoolColumnData(selectedCategoryId, selectedCategory.columns)
          .then(data => {
            setSchoolColumnData(data);
            setIsDataLoading(false);
          })
          .catch(error => {
            console.error("Məlumat yüklənərkən xəta baş verdi:", error);
            toast({
              title: "Xəta",
              description: "Məlumatlar yüklənərkən problem yarandı",
              variant: "destructive",
            });
            setIsDataLoading(false);
          });
      }
    } else if (categories.length > 0 && !selectedCategoryId) {
      // İlk kateqoriyanı seçək
      setSelectedCategoryId(categories[0].id);
    }
  }, [selectedCategoryId, categories]);

  return {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    schoolColumnData,
    isCategoriesLoading,
    isCategoriesError,
    isDataLoading
  };
};
