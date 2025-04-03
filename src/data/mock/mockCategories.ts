
import { Category, MockCategory } from "@/types/category";
import { getMockCategories } from "@/data/mock";

// Mock kategoriya məlumatlarını əldə etmək üçün funksiya
export { getMockCategories };

export const createDemoCategories = (): MockCategory[] => getMockCategories();

export const createTeachersDemoCategory = (): MockCategory => ({
  id: "teacher-data",
  name: "Müəllim məlumatları",
  assignment: "sectors",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "active",
  priority: 2,
  description: "Müəllim heyəti haqqında məlumatlar",
  column_count: 5,
  order: 2,
  archived: false,
  completionRate: 65
});
