
import { useState, useEffect, useCallback } from "react";
import { Column } from "@/types/column";
import { get } from "lodash";

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

export const useSchoolColumnReport = (schoolId: string, categoryId: string) => {
  const [report, setReport] = useState<ColumnReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchColumnReport = useCallback(async () => {
    try {
      setLoading(true);
      
      // Bu mock məlumatlar real api sorğusu ilə əvəz edilməlidir
      // Bu nümunə məlumatlar göstərmək üçündür
      const mockReport: ColumnReport[] = [
        {
          schoolId,
          categoryId,
          categoryName: "Məktəb haqqında məlumatlar",
          columns: [
            {
              column: {
                id: "col-1",
                categoryId,
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
                categoryId,
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
                categoryId,
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
              value: true,
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
              value: true,
              status: "approved"
            }
          ]
        }
      ];
      
      setTimeout(() => {
        setReport(mockReport);
        setLoading(false);
      }, 500); // Mock loading delay
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Məlumatlar əldə edilərkən xəta baş verdi'));
      setLoading(false);
    }
  }, [schoolId, categoryId]);

  useEffect(() => {
    fetchColumnReport();
  }, [fetchColumnReport]);

  const getColumnValue = useCallback((colId: string) => {
    for (const category of report) {
      const column = category.columns.find(c => c.column.id === colId);
      if (column) return column.value;
    }
    return null;
  }, [report]);

  const getColumnStatus = useCallback((colId: string) => {
    for (const category of report) {
      const column = category.columns.find(c => c.column.id === colId);
      if (column) return column.status;
    }
    return null;
  }, [report]);

  return {
    report,
    loading,
    error,
    fetchColumnReport,
    getColumnValue,
    getColumnStatus
  };
};

export default useSchoolColumnReport;
