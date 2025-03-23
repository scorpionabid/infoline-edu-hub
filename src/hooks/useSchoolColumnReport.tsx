import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { CategoryWithColumns, Column } from '@/types/column';
import { SchoolColumnData, ExportOptions } from '@/types/report';
import { mockSchools } from '@/data/schoolsData';
import { toast } from '@/components/ui/use-toast';

// Mock data generator
const generateMockSchoolColumnData = (
  categoryId: string, 
  columns: Column[]
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
          assignment: "all",
          priority: 1,
          description: "Təcili şəkildə toplanması tələb olunan məlumatlar",
          status: "active",
          columns: [
            { 
              id: "c1", 
              categoryId: "1", 
              name: "Şagird sayı", 
              type: "number", 
              isRequired: true, 
              order: 1, 
              status: "active" 
            },
            { 
              id: "c2", 
              categoryId: "1", 
              name: "Müəllim sayı", 
              type: "number", 
              isRequired: true, 
              order: 2, 
              status: "active" 
            },
            { 
              id: "c3", 
              categoryId: "1", 
              name: "Sinif sayı", 
              type: "number", 
              isRequired: true, 
              order: 3, 
              status: "active" 
            }
          ]
        },
        {
          id: "2",
          name: "Tədris",
          assignment: "all",
          priority: 2,
          description: "Tədris prosesi haqqında məlumatlar",
          status: "active",
          columns: [
            { 
              id: "c4", 
              categoryId: "2", 
              name: "Dərs saatı", 
              type: "number", 
              isRequired: true, 
              order: 1, 
              status: "active" 
            },
            { 
              id: "c5", 
              categoryId: "2", 
              name: "Fənn sayı", 
              type: "number", 
              isRequired: false, 
              order: 2, 
              status: "active" 
            },
            { 
              id: "c6", 
              categoryId: "2", 
              name: "Təhsil keyfiyyəti", 
              type: "text", 
              isRequired: false, 
              order: 3, 
              status: "active" 
            }
          ]
        },
        {
          id: "3",
          name: "İnfrastruktur",
          assignment: "sectors",
          priority: 3,
          description: "Məktəb infrastrukturu haqqında məlumatlar",
          status: "active",
          columns: [
            { 
              id: "c7", 
              categoryId: "3", 
              name: "Bina sahəsi", 
              type: "number", 
              isRequired: true, 
              order: 1, 
              status: "active" 
            },
            { 
              id: "c8", 
              categoryId: "3", 
              name: "Kompüter sayı", 
              type: "number", 
              isRequired: true, 
              order: 2, 
              status: "active" 
            },
            { 
              id: "c9", 
              categoryId: "3", 
              name: "İnternet mövcudluğu", 
              type: "checkbox", 
              isRequired: true, 
              order: 3, 
              status: "active" 
            }
          ]
        },
        {
          id: "4",
          name: "Davamiyyət",
          assignment: "all",
          priority: 4,
          description: "Şagird davamiyyəti haqqında məlumatlar",
          status: "active",
          columns: [
            { 
              id: "c10", 
              categoryId: "4", 
              name: "Ümumi davamiyyət %", 
              type: "number", 
              isRequired: true, 
              order: 1, 
              status: "active" 
            },
            { 
              id: "c11", 
              categoryId: "4", 
              name: "Dərsə gecikənlər", 
              type: "number", 
              isRequired: false, 
              order: 2, 
              status: "active" 
            },
            { 
              id: "c12", 
              categoryId: "4", 
              name: "Buraxılan günlər", 
              type: "number", 
              isRequired: true, 
              order: 3, 
              status: "active" 
            }
          ]
        },
        {
          id: "5",
          name: "Nailiyyət",
          assignment: "sectors",
          priority: 5,
          description: "Şagird nailiyyətləri haqqında məlumatlar",
          status: "active",
          columns: [
            { 
              id: "c13", 
              categoryId: "5", 
              name: "Olimpiada iştirakçıları", 
              type: "number", 
              isRequired: false, 
              order: 1, 
              status: "active" 
            },
            { 
              id: "c14", 
              categoryId: "5", 
              name: "Orta bal", 
              type: "number", 
              isRequired: true, 
              order: 2, 
              status: "active" 
            },
            { 
              id: "c15", 
              categoryId: "5", 
              name: "Ali məktəbə qəbul %", 
              type: "number", 
              isRequired: true, 
              order: 3, 
              status: "active" 
            }
          ]
        }
      ]);
    }, 500);
  });
};

// Mock data əldə etmə
const fetchSchoolColumnData = async (
  categoryId: string,
  columns: Column[]
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
