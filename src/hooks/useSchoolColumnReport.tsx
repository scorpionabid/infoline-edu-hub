
import { useState, useEffect, useCallback } from "react";
import { Column } from "@/types/column";
import { CategoryWithColumns } from "@/types/column";
import { SchoolColumnData } from "@/types/report";
import { toast } from "sonner";

export interface ColumnReport {
  schoolId: string;
  categoryId: string;
  categoryName: string;
  columns: {
    column: Column;
    value: string | number | null;
    status: string;
  }[];
}

export interface SchoolColumnReportHookResult {
  report: ColumnReport[];
  loading: boolean;
  error: Error | null;
  fetchColumnReport: () => Promise<void>;
  getColumnValue: (colId: string) => string | number | null;
  getColumnStatus: (colId: string) => string | null;
  // Əlavə edilmiş xassələr
  categories: CategoryWithColumns[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  schoolColumnData: SchoolColumnData[];
  sectors: string[];
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  isDataLoading: boolean;
  exportData: (options?: any) => void;
  toggleSchoolSelection: (schoolId: string) => void;
  selectAllSchools: () => void;
  deselectAllSchools: () => void;
  getSelectedSchoolsData: () => SchoolColumnData[];
}

export const useSchoolColumnReport = (schoolId: string, categoryId?: string): SchoolColumnReportHookResult => {
  const [report, setReport] = useState<ColumnReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Əlavə state-lər
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId || "");
  const [schoolColumnData, setSchoolColumnData] = useState<SchoolColumnData[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [isCategoriesError, setIsCategoriesError] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  const fetchColumnReport = useCallback(async () => {
    try {
      setLoading(true);
      
      // Bu mock məlumatlar real api sorğusu ilə əvəz edilməlidir
      // Bu nümunə məlumatlar göstərmək üçündür
      const mockReport: ColumnReport[] = [
        {
          schoolId,
          categoryId: categoryId || "",
          categoryName: "Məktəb haqqında məlumatlar",
          columns: [
            {
              column: {
                id: "col-1",
                categoryId: categoryId || "",
                name: "Şagird sayı",
                type: "number",
                isRequired: true,
                order: 1,
                orderIndex: 1,
                status: "active"
              },
              value: 450,
              status: "approved"
            },
            {
              column: {
                id: "col-2",
                categoryId: categoryId || "",
                name: "Müəllim sayı",
                type: "number",
                isRequired: true,
                order: 2,
                orderIndex: 2,
                status: "active"
              },
              value: 35,
              status: "approved"
            },
            {
              column: {
                id: "col-3",
                categoryId: categoryId || "",
                name: "Sinif otaqlarının sayı",
                type: "number",
                isRequired: true,
                order: 3,
                orderIndex: 3,
                status: "active"
              },
              value: 25,
              status: "approved"
            }
          ]
        },
        {
          schoolId,
          categoryId: "category-2",
          categoryName: "Təhsil göstəriciləri",
          columns: [
            {
              column: {
                id: "col-4",
                categoryId: "category-2",
                name: "Olimpiada nəticələri",
                type: "number",
                isRequired: true,
                order: 1,
                orderIndex: 4,
                status: "active"
              },
              value: 12,
              status: "pending"
            }
          ]
        },
        {
          schoolId,
          categoryId: "category-3",
          categoryName: "İnfrastruktur",
          columns: [
            {
              column: {
                id: "col-5",
                categoryId: "category-3",
                name: "Kompüter otağı",
                type: "checkbox",
                isRequired: true,
                order: 1,
                orderIndex: 5,
                status: "active"
              },
              value: "true", // String kimi qaytarılır
              status: "approved"
            },
            {
              column: {
                id: "col-6",
                categoryId: "category-3",
                name: "İdman zalı",
                type: "checkbox",
                isRequired: true,
                order: 2,
                orderIndex: 6,
                status: "active"
              },
              value: "true", // String kimi qaytarılır
              status: "approved"
            }
          ]
        }
      ];
      
      // Mock məlumatlar üçün kateqoriyalar
      const mockCategories: CategoryWithColumns[] = [
        {
          id: categoryId || "category-1",
          name: "Məktəb haqqında məlumatlar",
          description: "Əsas məktəb məlumatları",
          assignment: "all",
          priority: 1,
          deadline: "2023-12-31",
          status: "active",
          order: 1,
          columns: [
            {
              id: "col-1",
              categoryId: categoryId || "category-1",
              name: "Şagird sayı",
              type: "number",
              isRequired: true,
              order: 1,
              orderIndex: 1,
              status: "active"
            },
            {
              id: "col-2",
              categoryId: categoryId || "category-1",
              name: "Müəllim sayı",
              type: "number",
              isRequired: true,
              order: 2,
              orderIndex: 2,
              status: "active"
            },
            {
              id: "col-3",
              categoryId: categoryId || "category-1",
              name: "Sinif otaqlarının sayı",
              type: "number",
              isRequired: true,
              order: 3,
              orderIndex: 3,
              status: "active"
            }
          ]
        },
        {
          id: "category-2",
          name: "Təhsil göstəriciləri",
          description: "Təhsil nəticələri",
          assignment: "all",
          priority: 2,
          status: "active",
          order: 2,
          columns: [
            {
              id: "col-4",
              categoryId: "category-2",
              name: "Olimpiada nəticələri",
              type: "number",
              isRequired: true,
              order: 1,
              orderIndex: 4,
              status: "active"
            }
          ]
        },
        {
          id: "category-3",
          name: "İnfrastruktur",
          description: "Məktəbin infrastrukturu",
          assignment: "all",
          priority: 3,
          status: "active",
          order: 3,
          columns: [
            {
              id: "col-5",
              categoryId: "category-3",
              name: "Kompüter otağı",
              type: "checkbox",
              isRequired: true,
              order: 1,
              orderIndex: 5,
              status: "active"
            },
            {
              id: "col-6",
              categoryId: "category-3",
              name: "İdman zalı",
              type: "checkbox",
              isRequired: true,
              order: 2,
              orderIndex: 6,
              status: "active"
            }
          ]
        }
      ];
      
      // Mock məlumatlar üçün məktəblər
      const mockSchoolData: SchoolColumnData[] = [
        {
          schoolId: "school-1",
          schoolName: "28 nömrəli məktəb",
          region: "Bakı",
          sector: "Binəqədi",
          status: "Gözləmədə",
          columnData: [
            { columnId: "col-1", value: 450 },
            { columnId: "col-2", value: 35 },
            { columnId: "col-3", value: 25 }
          ]
        },
        {
          schoolId: "school-2",
          schoolName: "132 nömrəli məktəb",
          region: "Bakı",
          sector: "Nəsimi",
          status: "Təsdiqləndi",
          columnData: [
            { columnId: "col-1", value: 600 },
            { columnId: "col-2", value: 42 },
            { columnId: "col-3", value: 30 }
          ]
        },
        {
          schoolId: "school-3",
          schoolName: "220 nömrəli məktəb",
          region: "Bakı",
          sector: "Sabunçu",
          status: "Rədd edildi",
          rejectionReason: "Məlumatlar natamamdır",
          columnData: [
            { columnId: "col-1", value: 350 },
            { columnId: "col-2", value: 28 },
            { columnId: "col-3", value: 18 }
          ]
        }
      ];
      
      // Mock sektorlar
      const mockSectors = ["Binəqədi", "Nəsimi", "Sabunçu", "Xətai"];
      
      setTimeout(() => {
        setReport(mockReport);
        setCategories(mockCategories);
        setSchoolColumnData(mockSchoolData);
        setSectors(mockSectors);
        setLoading(false);
        setIsCategoriesLoading(false);
        setIsDataLoading(false);
      }, 500); // Mock loading delay
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Məlumatlar əldə edilərkən xəta baş verdi'));
      setLoading(false);
      setIsCategoriesError(true);
    }
  }, [schoolId, categoryId]);

  useEffect(() => {
    fetchColumnReport();
  }, [fetchColumnReport]);

  const getColumnValue = useCallback((colId: string): string | number | null => {
    for (const category of report) {
      const column = category.columns.find(c => c.column.id === colId);
      if (column) return column.value;
    }
    return null;
  }, [report]);

  const getColumnStatus = useCallback((colId: string): string | null => {
    for (const category of report) {
      const column = category.columns.find(c => c.column.id === colId);
      if (column) return column.status;
    }
    return null;
  }, [report]);
  
  // Əlavə edilmiş funksiyalar
  const exportData = useCallback((options?: any) => {
    toast.success('Məlumatlar ixrac edildi');
  }, []);
  
  const toggleSchoolSelection = useCallback((schoolId: string) => {
    setSelectedSchools(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      } else {
        return [...prev, schoolId];
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
  
  const getSelectedSchoolsData = useCallback(() => {
    return schoolColumnData.filter(school => selectedSchools.includes(school.schoolId));
  }, [schoolColumnData, selectedSchools]);

  return {
    report,
    loading,
    error,
    fetchColumnReport,
    getColumnValue,
    getColumnStatus,
    // Əlavə qaytarılan xassələr
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    schoolColumnData,
    sectors,
    isCategoriesLoading,
    isCategoriesError,
    isDataLoading,
    exportData,
    toggleSchoolSelection,
    selectAllSchools,
    deselectAllSchools,
    getSelectedSchoolsData
  };
};

export default useSchoolColumnReport;
