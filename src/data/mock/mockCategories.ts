
import { MockCategory } from "@/types/category";

// Mock kategoriya məlumatlarını əldə etmək üçün funksiya
export const getMockCategories = (): MockCategory[] => {
  return [
    {
      id: "1",
      name: "Təcili məlumatlar",
      assignment: "all",
      createdAt: new Date("2023-01-15").toISOString(),
      updatedAt: new Date("2023-02-10").toISOString(),
      status: "active",
      priority: 1,
      description: "Məktəbin ümumi təsviri və əsas məlumatları",
      columnCount: 3,
      order: 1,
      archived: false,
      completionRate: 85
    },
    {
      id: "2",
      name: "Tədris",
      assignment: "sectors",
      createdAt: new Date("2023-01-20").toISOString(),
      updatedAt: new Date("2023-03-05").toISOString(),
      status: "active",
      priority: 2,
      description: "Tədris planı və proqram məlumatları",
      columnCount: 2,
      order: 2,
      archived: false,
      completionRate: 60
    },
    {
      id: "3",
      name: "İnfrastruktur",
      assignment: "all",
      createdAt: new Date("2023-02-01").toISOString(), 
      updatedAt: new Date("2023-02-20").toISOString(),
      status: "active",
      priority: 3,
      description: "Məktəbin infrastruktur və texniki məlumatları",
      columnCount: 3,
      order: 3,
      archived: false,
      completionRate: 75
    },
    {
      id: "4",
      name: "Davamiyyət",
      assignment: "sectors",
      createdAt: new Date("2023-02-15").toISOString(),
      updatedAt: new Date("2023-04-10").toISOString(),
      status: "active",
      priority: 4,
      description: "Davamiyyət haqqında məlumatlar",
      columnCount: 3,
      order: 4,
      archived: false,
      completionRate: 40
    },
    {
      id: "5",
      name: "Nailiyyət",
      assignment: "sectors",
      createdAt: new Date("2023-03-01").toISOString(),
      updatedAt: new Date("2023-03-25").toISOString(),
      status: "active",
      priority: 5,
      description: "Şagirdlərin akademik nailiyyətləri və statistikaları",
      columnCount: 2,
      order: 5,
      archived: false,
      completionRate: 25
    },
    {
      id: "6",
      name: "Təhsil planlaşdırması",
      assignment: "all",
      createdAt: new Date("2023-03-10").toISOString(),
      updatedAt: new Date("2023-04-01").toISOString(),
      status: "active",
      priority: 6,
      description: "Tədris ili üçün planlaşdırma məlumatları",
      columnCount: 4,
      order: 6,
      archived: false,
      completionRate: 95
    },
    {
      id: "7",
      name: "Abituriyent hazırlığı",
      assignment: "sectors",
      createdAt: new Date("2023-03-20").toISOString(),
      updatedAt: new Date("2023-04-15").toISOString(),
      status: "active",
      priority: 7,
      description: "Abituriyent hazırlığı və nəticələri",
      columnCount: 5,
      order: 7,
      archived: false,
      completionRate: 70
    },
    {
      id: "8",
      name: "Olimpiyada nəticələri",
      assignment: "all",
      createdAt: new Date("2023-04-01").toISOString(),
      updatedAt: new Date("2023-04-20").toISOString(),
      status: "inactive",
      priority: 8,
      description: "Respublika və beynəlxalq olimpiyada nəticələri",
      columnCount: 3,
      order: 8,
      archived: false,
      completionRate: 50
    }
  ];
};

export const createDemoCategories = () => getMockCategories();

export const createTeachersDemoCategory = () => ({
  id: "teacher-data",
  name: "Müəllim məlumatları",
  assignment: "sectors",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "active",
  priority: 2,
  description: "Müəllim heyəti haqqında məlumatlar",
  columnCount: 5,
  order: 2,
  archived: false,
  completionRate: 65
});
