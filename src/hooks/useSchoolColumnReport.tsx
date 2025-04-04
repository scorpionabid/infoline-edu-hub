
import { useCallback, useEffect, useState } from 'react';
import { School } from '@/types/school';
import { CategoryWithColumns } from '@/types/column';
import { useColumns } from './useColumns';

// Test/demo verilənləri
const mockSchool: School = {
  id: "school-1",
  name: "Şəhər Məktəbi #123",
  regionId: "region-1",
  sectorId: "sector-1",
  address: "Bakı şəhəri, Nəsimi rayonu",
  status: "active",
};

const mockCategories: CategoryWithColumns[] = [
  {
    id: "cat-1",
    name: "Ümumi məlumatlar",
    description: "Məktəb haqqında ümumi məlumatlar",
    status: "active",
    priority: 1,
    assignment: "all",
    createdAt: new Date().toISOString(),
    columns: [
      { id: "col-1", categoryId: "cat-1", name: "Şagird sayı", type: "number", isRequired: true, order: 1, status: "active" },
      { id: "col-2", categoryId: "cat-1", name: "Müəllim sayı", type: "number", isRequired: true, order: 2, status: "active" },
      { id: "col-3", categoryId: "cat-1", name: "Otaq sayı", type: "number", isRequired: true, order: 3, status: "active" },
    ]
  },
  {
    id: "cat-2",
    name: "Tədris statistikası",
    description: "Tədris statistikası haqqında məlumatlar",
    status: "active",
    priority: 2,
    assignment: "all",
    createdAt: new Date().toISOString(),
    columns: [
      { id: "col-4", categoryId: "cat-2", name: "Buraxılış faizi", type: "number", isRequired: true, order: 1, status: "active" },
    ]
  },
  {
    id: "cat-3",
    name: "İnfrastruktur",
    description: "İnfrastruktur haqqında məlumatlar",
    status: "active",
    priority: 3,
    assignment: "all",
    createdAt: new Date().toISOString(),
    columns: [
      { id: "col-5", categoryId: "cat-3", name: "İdman zalı", type: "boolean", isRequired: true, order: 1, status: "active" },
      { id: "col-6", categoryId: "cat-3", name: "Kitabxana", type: "boolean", isRequired: true, order: 2, status: "active" },
    ]
  }
];

// Məktəb sütun məlumatları
interface SchoolColumnData {
  schoolId: string;
  schoolName: string;
  region?: string;
  sector?: string;
  status?: string;
  rejectionReason?: string;
  columnData: {
    columnId: string;
    value: any;
    status?: string;
  }[];
}

export interface SchoolColumnReport {
  school: School;
  categories: CategoryWithColumns[];
  selectedCategoryId: string;
  setSelectedCategoryId: (categoryId: string) => void;
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

export const useSchoolColumnReport = (schoolId?: string): SchoolColumnReport => {
  const [school, setSchool] = useState<School>(mockSchool);
  const [categories, setCategories] = useState<CategoryWithColumns[]>(mockCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(mockCategories[0]?.id || '');
  const [schoolColumnData, setSchoolColumnData] = useState<SchoolColumnData[]>([]);
  const [sectors, setSectors] = useState<string[]>(['Bakı şəhəri', 'Abşeron', 'Sumqayıt']);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(false);
  const [isCategoriesError, setIsCategoriesError] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const { columns } = useColumns();

  useEffect(() => {
    // Real verilənləri backenddən çəkmək üçün istifadə edilə bilər
    // Məsələn:
    // fetch(`/api/schools/${schoolId}`).then(res => res.json()).then(data => setSchool(data));
    // fetch(`/api/schools/${schoolId}/categories`).then(res => res.json()).then(data => setCategories(data));
    
    // Demo məlumatlar
    const mockSchoolData: SchoolColumnData[] = [
      {
        schoolId: "school-1",
        schoolName: "Şəhər Məktəbi #123",
        region: "Bakı",
        sector: "Nəsimi",
        status: "Gözləmədə",
        columnData: [
          { columnId: "col-1", value: 1200 },
          { columnId: "col-2", value: 85 },
          { columnId: "col-3", value: 42 },
          { columnId: "col-4", value: 98 },
          { columnId: "col-5", value: true },
          { columnId: "col-6", value: true },
        ]
      },
      {
        schoolId: "school-2",
        schoolName: "Kənd Məktəbi #45",
        region: "Abşeron",
        sector: "Xırdalan",
        status: "Gözləmədə",
        columnData: [
          { columnId: "col-1", value: 450 },
          { columnId: "col-2", value: 32 },
          { columnId: "col-3", value: 18 },
          { columnId: "col-4", value: 92 },
          { columnId: "col-5", value: false },
          { columnId: "col-6", value: true },
        ]
      }
    ];
    
    setSchoolColumnData(mockSchoolData);
  }, [schoolId]);

  const toggleSchoolSelection = (schoolId: string) => {
    setSelectedSchools(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      } else {
        return [...prev, schoolId];
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
    return schoolColumnData.filter(school => selectedSchools.includes(school.schoolId));
  };

  const exportData = (options?: any) => {
    console.log("Exporting data with options:", options);
    // Excel ixracını həyata keçirə bilər
  };

  return { 
    school, 
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
