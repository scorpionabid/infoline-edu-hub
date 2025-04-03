
import { Category } from "@/types/category";

// Kateqoriyaları əldə etmək üçün API funksiyası
export const fetchCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Return mock data with improved details
  return [
    {
      id: "1",
      name: "Təcili məlumatlar",
      assignment: "all",
      status: "active",
      priority: 1,
      description: "Məktəbin ümumi təsviri və əsas məlumatları",
      column_count: 3,
      order: 1,
      archived: false,
      created_at: new Date("2023-01-15").toISOString(),
      updated_at: new Date("2023-02-10").toISOString()
    },
    {
      id: "2",
      name: "Tədris",
      assignment: "sectors",
      status: "active",
      priority: 2,
      description: "Tədris planı və proqram məlumatları",
      column_count: 2,
      order: 2,
      archived: false,
      created_at: new Date("2023-01-20").toISOString(),
      updated_at: new Date("2023-03-05").toISOString()
    },
    {
      id: "3",
      name: "İnfrastruktur",
      assignment: "all",
      status: "active", 
      priority: 3,
      description: "Məktəbin infrastruktur və texniki məlumatları",
      column_count: 3,
      order: 3,
      archived: false,
      created_at: new Date("2023-02-01").toISOString(), 
      updated_at: new Date("2023-02-20").toISOString()
    },
    {
      id: "4",
      name: "Davamiyyət",
      assignment: "sectors",
      status: "active",
      priority: 4,
      description: "Davamiyyət haqqında məlumatlar",
      column_count: 3,
      order: 4,
      archived: false,
      created_at: new Date("2023-02-15").toISOString(),
      updated_at: new Date("2023-04-10").toISOString()
    },
    {
      id: "5",
      name: "Nailiyyət",
      assignment: "sectors",
      status: "active",
      priority: 5,
      description: "Şagirdlərin akademik nailiyyətləri və statistikaları",
      column_count: 2,
      order: 5,
      archived: false,
      created_at: new Date("2023-03-01").toISOString(),
      updated_at: new Date("2023-03-25").toISOString()
    }
  ];
};

// Kateqoriya əlavə etmək və ya yeniləmək üçün API funksiyası
export const addCategory = async (categoryData: Omit<Category, "id"> & { id?: string }): Promise<Category> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Əgər id varsa, bu redaktə əməliyyatıdır, əks halda yeni kateqoriya yaradılır
  return {
    ...categoryData,
    id: categoryData.id || Date.now().toString(),
    order: categoryData.priority || Date.now(), // Əgər priority yoxdursa, bir standart dəyər təyin edirik
    archived: categoryData.archived || false, // Əlavə edildi
    column_count: categoryData.column_count || 0, // Əlavə edildi
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as Category;
};

// Kateqoriya silmək üçün API funksiyası
export const deleteCategory = async (id: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  // Mock successful response
  return true;
};

// Kateqoriya statusunu yeniləmək üçün API funksiyası
export const updateCategoryStatus = async (id: string, status: "active" | "inactive"): Promise<boolean> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  // Mock successful response
  return true;
};
