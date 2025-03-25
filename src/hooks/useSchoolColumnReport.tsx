import { useCallback, useEffect, useState } from 'react';
import { School } from '@/types/school';
import { CategoryWithColumns } from '@/types/column';
import { useColumns } from './useColumns';

// Test/demo verilənləri
const mockSchool: School = {
  id: "school-1",
  name: "Şəhər Məktəbi #123",
  region_id: "region-1",
  sector_id: "sector-1",
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

interface SchoolColumnReport {
  school: School;
  categories: CategoryWithColumns[];
}

export const useSchoolColumnReport = (schoolId: string): SchoolColumnReport => {
  const [school, setSchool] = useState<School>(mockSchool);
  const [categories, setCategories] = useState<CategoryWithColumns[]>(mockCategories);
  const { columns } = useColumns();

  useEffect(() => {
    // Real verilənləri backenddən çəkmək üçün istifadə edilə bilər
    // Məsələn:
    // fetch(`/api/schools/${schoolId}`).then(res => res.json()).then(data => setSchool(data));
    // fetch(`/api/schools/${schoolId}/categories`).then(res => res.json()).then(data => setCategories(data));
  }, [schoolId]);

  return { school, categories };
};
