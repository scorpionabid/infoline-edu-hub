
import { Category, MockCategory } from "@/types/category";

// Nümunə kateqoriyalar
export const getMockCategories = (): MockCategory[] => [
  {
    id: "cat-1",
    name: "Ümumi Məlumatlar",
    description: "Məktəb haqqında əsas məlumatlar",
    assignment: "all",
    status: "active",
    priority: 1,
    column_count: 5,
    archived: false,
    completionRate: 85
  },
  {
    id: "teacher-data",
    name: "Müəllim məlumatları",
    description: "Məktəbdəki müəllimlər haqqında statistika",
    assignment: "sectors",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "active",
    priority: 2,
    column_count: 5,
    order: 2,
    archived: false,
    completionRate: 65
  },
  {
    id: "cat-3",
    name: "İnfrastruktur",
    description: "Məktəbin maddi-texniki bazası haqqında məlumatlar",
    assignment: "all",
    status: "active",
    priority: 3,
    column_count: 8,
    archived: false,
    completionRate: 40
  }
];

export const createTeachersDemoCategory = (): MockCategory => ({
  id: "teacher-data",
  name: "Müəllim məlumatları",
  description: "Məktəbdəki müəllimlər haqqında statistika",
  assignment: "sectors",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "active",
  priority: 2,
  column_count: 5,
  order: 2,
  archived: false,
  completionRate: 65
});

export const createDemoCategories = (): MockCategory[] => getMockCategories();
