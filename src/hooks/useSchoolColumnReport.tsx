
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Column } from '@/types/column';
import { SchoolColumnData, ExportOptions } from '@/types/report';
import { exportToExcel } from '@/utils/excelExport';

// Sample data to simulate API response
const sampleSchoolData: SchoolColumnData[] = [
  {
    schoolId: "school1",
    schoolName: "Bakı 6 saylı məktəb",
    columnData: [
      { columnId: "col1", value: 125 },
      { columnId: "col2", value: "Azərbaycan" },
      { columnId: "col3", value: "2023-09-01" }
    ]
  },
  {
    schoolId: "school2",
    schoolName: "Bakı 28 saylı məktəb",
    columnData: [
      { columnId: "col1", value: 210 },
      { columnId: "col2", value: "Azərbaycan" },
      { columnId: "col3", value: "2023-09-15" }
    ]
  },
  {
    schoolId: "school3",
    schoolName: "Sumqayıt 5 saylı məktəb",
    columnData: [
      { columnId: "col1", value: 98 },
      { columnId: "col2", value: "Rus" },
      { columnId: "col3", value: "2023-08-25" }
    ]
  }
];

// Sample columns
const sampleColumns: Column[] = [
  { id: "col1", categoryId: "cat1", name: "Şagird sayı", type: "number", isRequired: true, order: 1, status: "active" },
  { id: "col2", categoryId: "cat1", name: "Tədris dili", type: "text", isRequired: true, order: 2, status: "active" },
  { id: "col3", categoryId: "cat1", name: "Tədris ili başlama tarixi", type: "date", isRequired: true, order: 3, status: "active" }
];

export const useSchoolColumnReport = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<SchoolColumnData[]>(sampleSchoolData);
  const [columns, setColumns] = useState<Column[]>(sampleColumns);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  const fetchData = async (categoryId: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, you would fetch from API
      // const response = await api.get(`/reports/categories/${categoryId}/schools`);
      // setData(response.data.schoolsData);
      // setColumns(response.data.columns);
      
      // For now, we're using the sample data
      setData(sampleSchoolData);
      setColumns(sampleColumns);
      
      toast.success(t("dataFetchSuccess"));
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error(t("dataFetchError"));
    } finally {
      setIsLoading(false);
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
    const allSchoolIds = data.map(school => school.schoolId);
    setSelectedSchools(allSchoolIds);
  };

  const deselectAllSchools = () => {
    setSelectedSchools([]);
  };

  const getSelectedSchoolsData = () => {
    if (selectedSchools.length === 0) return data;
    return data.filter(school => selectedSchools.includes(school.schoolId));
  };

  const exportData = (options: ExportOptions = {}) => {
    try {
      const dataToExport = getSelectedSchoolsData();
      
      if (dataToExport.length === 0) {
        toast.error(t("noDataToExport"));
        return;
      }
      
      const result = exportToExcel(dataToExport, columns, options);
      
      if (result.success) {
        toast.success(t("exportSuccess", { fileName: result.fileName }));
      } else {
        toast.error(t("exportError"));
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error(t("exportError"));
    }
  };

  return {
    data,
    columns,
    isLoading,
    selectedSchools,
    fetchData,
    toggleSchoolSelection,
    selectAllSchools,
    deselectAllSchools,
    getSelectedSchoolsData,
    exportData
  };
};
