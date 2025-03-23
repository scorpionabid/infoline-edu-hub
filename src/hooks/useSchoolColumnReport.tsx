
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Column, CategoryWithColumns } from '@/types/column';
import { SchoolColumnData, ExportOptions } from '@/types/report';
import { exportToExcel } from '@/utils/excelExport';
import { mockSchools } from '@/data/schoolsData';
import { useQuery } from '@tanstack/react-query';

// API sorğusunu simulyasiya edən funksiya
const fetchCategories = async (): Promise<CategoryWithColumns[]> => {
  // API sorğusunu simulyasiya edək (əslində bu məlumatlar API-dən gələcək)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Bu misalda işlətdiyimiz kateqoriyalar
  return [
    {
      id: "cat1",
      name: "Tədris məlumatları",
      columns: [
        { id: "col1", categoryId: "cat1", name: "Şagird sayı", type: "number", isRequired: true, order: 1, status: "active" },
        { id: "col2", categoryId: "cat1", name: "Tədris dili", type: "text", isRequired: true, order: 2, status: "active" },
        { id: "col3", categoryId: "cat1", name: "Tədris ili başlama tarixi", type: "date", isRequired: true, order: 3, status: "active" }
      ]
    },
    {
      id: "cat2",
      name: "Müəllim məlumatları",
      columns: [
        { id: "col4", categoryId: "cat2", name: "Müəllim sayı", type: "number", isRequired: true, order: 1, status: "active" },
        { id: "col5", categoryId: "cat2", name: "Ali təhsilli müəllim sayı", type: "number", isRequired: true, order: 2, status: "active" }
      ]
    }
  ];
};

// Kateqoriyaya uyğun cədvəl məlumatlarını əldə etmək üçün funksiya
const fetchSchoolColumnData = async (categoryId: string): Promise<SchoolColumnData[]> => {
  // API sorğusunu simulyasiya edək
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mövcud məktəbləri əldə edək
  const schools = mockSchools;
  
  // Kateqoriyaya uyğun məlumatları generasiya edək
  return schools.map(school => {
    // Kateqoriyaya uyğun sütun məlumatlarını generasiya edək
    let columnData = [];
    
    if (categoryId === "cat1") {
      columnData = [
        { columnId: "col1", value: school.studentCount },
        { columnId: "col2", value: school.language === "az" ? "Azərbaycan" : (school.language === "ru" ? "Rus" : "Digər") },
        { columnId: "col3", value: "2023-09-01" }
      ];
    } else if (categoryId === "cat2") {
      columnData = [
        { columnId: "col4", value: school.teacherCount },
        { columnId: "col5", value: Math.floor(school.teacherCount * 0.8) } // Təxmini dəyər
      ];
    }
    
    return {
      schoolId: school.id,
      schoolName: school.name,
      region: school.region,
      sector: school.sector,
      columnData
    };
  });
};

export const useSchoolColumnReport = () => {
  const { t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  // Kateqoriyaları əldə etmək üçün React Query istifadə edək
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading, 
    error: categoriesError 
  } = useQuery({
    queryKey: ['reportCategories'],
    queryFn: fetchCategories,
    meta: {
      successCallback: (data: CategoryWithColumns[]) => {
        // İlk kateqoriyanı default olaraq seçək
        if (data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].id);
        }
      }
    }
  });

  // useEffect ilə successCallback-ı simulyasiya edək
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Seçilmiş kateqoriyaya əsasən məktəblərin məlumatlarını əldə etmək
  const {
    data: schoolColumnData = [],
    isLoading: isDataLoading,
    refetch: refetchData
  } = useQuery({
    queryKey: ['reportSchoolData', selectedCategoryId],
    queryFn: () => fetchSchoolColumnData(selectedCategoryId),
    enabled: !!selectedCategoryId
  });

  // Məktəb seçimi funksiyaları
  const toggleSchoolSelection = useCallback((schoolId: string) => {
    setSelectedSchools(prevSelected => {
      if (prevSelected.includes(schoolId)) {
        return prevSelected.filter(id => id !== schoolId);
      } else {
        return [...prevSelected, schoolId];
      }
    });
  }, []);

  const selectAllSchools = useCallback(() => {
    const allSchoolIds = schoolColumnData.map(school => school.schoolId);
    setSelectedSchools(allSchoolIds);
  }, [schoolColumnData]);

  const deselectAllSchools = useCallback(() => {
    setSelectedSchools([]);
  }, []);

  // Seçilmiş məktəblərin məlumatlarını əldə etmək
  const getSelectedSchoolsData = useCallback(() => {
    if (selectedSchools.length === 0) return schoolColumnData;
    return schoolColumnData.filter(school => selectedSchools.includes(school.schoolId));
  }, [schoolColumnData, selectedSchools]);

  // Excel ixracı üçün funksiya
  const exportData = useCallback((options: ExportOptions = {}) => {
    try {
      const dataToExport = getSelectedSchoolsData();
      
      if (dataToExport.length === 0) {
        toast.error(t("noDataToExport"));
        return;
      }
      
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      if (!selectedCategory) {
        toast.error(t("categoryNotFound"));
        return;
      }

      const result = exportToExcel(dataToExport, selectedCategory.columns, options);
      
      if (result.success) {
        toast.success(t("exportSuccess"));
      } else {
        toast.error(t("exportError"));
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error(t("exportError"));
    }
  }, [categories, getSelectedSchoolsData, selectedCategoryId, t]);

  return {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    schoolColumnData,
    isCategoriesLoading,
    isCategoriesError: !!categoriesError,
    isDataLoading,
    selectedSchools,
    toggleSchoolSelection,
    selectAllSchools,
    deselectAllSchools,
    getSelectedSchoolsData,
    exportData
  };
};
