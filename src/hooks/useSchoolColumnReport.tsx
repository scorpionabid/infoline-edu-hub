
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Column, CategoryWithColumns, ColumnType, ColumnOption } from '@/types/column'; // ColumnType import əlavə edildi
import { SchoolColumnData, ExportOptions } from '@/types/report';
import { exportToExcel } from '@/utils/excelExport';
import { mockSchools } from '@/data/schoolsData';
import { useAuth } from '@/context/AuthContext';
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
    },
    {
      id: "cat3",
      name: "İnfrastruktur məlumatları",
      columns: [
        { id: "col6", categoryId: "cat3", name: "Kompüter sayı", type: "number", isRequired: true, order: 1, status: "active" },
        { id: "col7", categoryId: "cat3", name: "Proyektor sayı", type: "number", isRequired: true, order: 2, status: "active" },
        { id: "col8", categoryId: "cat3", name: "İnternet bağlantısı", type: "boolean", isRequired: true, order: 3, status: "active" }
      ]
    }
  ];
};

// Kateqoriyaya uyğun cədvəl məlumatlarını əldə etmək üçün funksiya
const fetchSchoolColumnData = async (categoryId: string, regionId?: string): Promise<SchoolColumnData[]> => {
  // API sorğusunu simulyasiya edək
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mövcud məktəbləri əldə edək
  const schools = mockSchools;
  
  // Regiona görə məktəbləri filtirləyək
  const filteredSchools = regionId 
    ? schools.filter(school => school.regionId === regionId)
    : schools;
  
  // Kateqoriyaya uyğun məlumatları generasiya edək
  return filteredSchools.map(school => {
    // Status dəyişkənini təsadüfi olaraq təyin edək (əsl API-də bu status verilənlər bazasından gələcək)
    const statuses = ["Gözləmədə", "Təsdiqləndi", "Rədd edildi"];
    const randomStatus = Math.random() < 0.6 ? "Gözləmədə" : (Math.random() < 0.8 ? "Təsdiqləndi" : "Rədd edildi");
    
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
    } else if (categoryId === "cat3") {
      columnData = [
        { columnId: "col6", value: Math.floor(Math.random() * 50) + 5 }, // 5-55 arası təsadüfi dəyər
        { columnId: "col7", value: Math.floor(Math.random() * 10) + 1 }, // 1-10 arası təsadüfi dəyər
        { columnId: "col8", value: Math.random() > 0.2 } // 80% ehtimalla true, 20% ehtimalla false
      ];
    }
    
    return {
      schoolId: school.id,
      schoolName: school.name,
      region: school.region,
      sector: school.sector,
      status: randomStatus,
      rejectionReason: randomStatus === "Rədd edildi" ? "Məlumatlar tam deyil" : undefined,
      columnData
    };
  });
};

export const useSchoolColumnReport = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  // Kateqoriyaları əldə etmək üçün React Query istifadə edək
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading, 
    error: categoriesError 
  } = useQuery({
    queryKey: ['reportCategories'],
    queryFn: fetchCategories
  });

  // Əgər istifadəçi region admindirsə, onun regionID-nı əldə edək
  const userRegionId = user?.role === 'regionadmin' ? user.regionId : undefined;

  // Əgər kateqoriyalar yüklənibsə və seçilmiş kateqoriya yoxdursa, ilk kateqoriyanı seçək
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  // Seçilmiş kateqoriyaya əsasən məktəblərin məlumatlarını əldə etmək
  const {
    data: schoolColumnData = [],
    isLoading: isDataLoading,
    refetch: refetchSchoolData
  } = useQuery({
    queryKey: ['reportSchoolData', selectedCategoryId, userRegionId],
    queryFn: () => fetchSchoolColumnData(selectedCategoryId, userRegionId),
    enabled: !!selectedCategoryId
  });

  // Sektorların siyahısını əldə et
  const sectors = React.useMemo(() => {
    const uniqueSectors = new Set<string>();
    schoolColumnData.forEach(school => {
      if (school.sector) {
        uniqueSectors.add(school.sector);
      }
    });
    return Array.from(uniqueSectors);
  }, [schoolColumnData]);

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

      // Column tipini CategoryColumn tipinə düzgün çevirmək
      const typedColumns = selectedCategory.columns.map(column => ({
        ...column,
        type: column.type as ColumnType,
        order: column.order || 0 // order məcburidir, default 0 dəyərini əlavə edirik
      }));

      const result = exportToExcel(dataToExport, typedColumns, options);
      
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
    sectors,
    isCategoriesLoading,
    isCategoriesError: !!categoriesError,
    isDataLoading,
    selectedSchools,
    toggleSchoolSelection,
    selectAllSchools,
    deselectAllSchools,
    getSelectedSchoolsData,
    exportData,
    refetchSchoolData
  };
};
