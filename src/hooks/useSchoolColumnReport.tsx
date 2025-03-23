
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Column, CategoryWithColumns } from '@/types/column';
import { SchoolColumnData, ExportOptions } from '@/types/report';
import { exportToExcel } from '@/utils/excelExport';

// Mock kateqoriyalar
const mockCategories: CategoryWithColumns[] = [
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

// Sample data to simulate API response
const sampleSchoolData: SchoolColumnData[] = [
  {
    schoolId: "school1",
    schoolName: "Bakı 6 saylı məktəb",
    region: "Bakı",
    sector: "Yasamal",
    columnData: [
      { columnId: "col1", value: 125 },
      { columnId: "col2", value: "Azərbaycan" },
      { columnId: "col3", value: "2023-09-01" }
    ]
  },
  {
    schoolId: "school2",
    schoolName: "Bakı 28 saylı məktəb",
    region: "Bakı",
    sector: "Nəsimi",
    columnData: [
      { columnId: "col1", value: 210 },
      { columnId: "col2", value: "Azərbaycan" },
      { columnId: "col3", value: "2023-09-15" }
    ]
  },
  {
    schoolId: "school3",
    schoolName: "Sumqayıt 5 saylı məktəb",
    region: "Sumqayıt",
    sector: "Mərkəz",
    columnData: [
      { columnId: "col1", value: 98 },
      { columnId: "col2", value: "Rus" },
      { columnId: "col3", value: "2023-08-25" }
    ]
  }
];

export const useSchoolColumnReport = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryWithColumns[]>(mockCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(mockCategories[0]?.id || "");
  const [schoolColumnData, setSchoolColumnData] = useState<SchoolColumnData[]>(sampleSchoolData);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isCategoriesError, setIsCategoriesError] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  const fetchData = async (categoryId: string) => {
    setIsDataLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, we're using the sample data
      setSchoolColumnData(sampleSchoolData);
      
      toast.success(t("dataFetchSuccess"));
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error(t("dataFetchError"));
    } finally {
      setIsDataLoading(false);
    }
  };

  const toggleSchoolSelection = (schoolId: string) => {
    setSelectedSchools(prevSelected => {
      if (prevSelected.includes(schoolId)) {
        return prevSelected.filter(id => id !== schoolId);
      } else {
        return [...prevSelected, schoolId];
      }
    });
  };

  const selectAllSchools = () => {
    const allSchoolIds = schoolColumnData.map(school => school.schoolId);
    setSelectedSchools(allSchoolIds);
  };

  const deselectAllSchools = () => {
    setSelectedSchools([]);
  };

  const getSelectedSchoolsData = () => {
    if (selectedSchools.length === 0) return schoolColumnData;
    return schoolColumnData.filter(school => selectedSchools.includes(school.schoolId));
  };

  const exportData = (options: ExportOptions = {}) => {
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
  };

  return {
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    schoolColumnData,
    isCategoriesLoading,
    isCategoriesError,
    isDataLoading,
    selectedSchools,
    fetchData,
    toggleSchoolSelection,
    selectAllSchools,
    deselectAllSchools,
    getSelectedSchoolsData,
    exportData
  };
};
