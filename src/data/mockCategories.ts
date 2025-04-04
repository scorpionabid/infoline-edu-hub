import { Category } from "@/types/category";
import { Column } from "@/types/column";

// Kateqoriyaları daha uyğun formata çevirək
const adaptMockCategory = (data: any): Category => {
  return {
    id: data.id || '',
    name: data.name || '',
    description: data.description || '',
    status: data.status || 'active',
    assignment: data.assignment || 'all',
    priority: data.priority || 0,
    archived: data.archived || false,
    column_count: data.column_count || 0,
    order: data.order || data.priority || 0,
    deadline: data.deadline || null
  };
};

// Mock kateqoriyalar
export const mockCategories: Category[] = [
  adaptMockCategory({
    id: 'cat-1',
    name: 'Şagird sayları',
    description: 'Məktəbdəki şagirdlərin sayı haqqında məlumat',
    status: 'active',
    assignment: 'all',
    priority: 1
  }),
  adaptMockCategory({
    id: 'cat-2',
    name: 'Müəllim sayları',
    description: 'Məktəbdəki müəllimlərin sayı haqqında məlumat',
    status: 'active',
    assignment: 'all',
    priority: 2
  }),
  adaptMockCategory({
    id: 'cat-3',
    name: 'İnfrastruktur',
    description: 'Məktəbin infrastrukturu haqqında məlumat',
    status: 'active',
    assignment: 'all',
    priority: 3
  }),
  adaptMockCategory({
    id: 'cat-4',
    name: 'Sektor hesabatları',
    description: 'Sektorlar üzrə xüsusi hesabatlar',
    status: 'active',
    assignment: 'sectors',
    priority: 4
  }),
  adaptMockCategory({
    id: 'cat-5',
    name: 'Tədris proqramları',
    description: 'Tədris proqramları haqqında məlumat',
    status: 'active',
    assignment: 'all',
    priority: 5
  })
];

// Mock sütunlar
export const mockColumns: Column[] = [
  {
    id: 'col-1',
    name: 'Məktəb adı',
    type: 'text',
    categoryId: 'cat-1',
    isRequired: true,
    options: [],
    placeholder: 'Məktəbin adını daxil edin',
    helpText: 'Məktəbin tam rəsmi adını daxil edin',
    defaultValue: '',
    validation: { 
      required: true,
      minLength: 3, 
      maxLength: 100 
    },
    status: 'active',
    orderIndex: 1,
    order: 1
  },
  {
    id: 'col-2',
    name: 'Şagird sayı',
    type: 'number',
    categoryId: 'cat-1',
    isRequired: true,
    options: [],
    placeholder: 'Şagird sayını daxil edin',
    helpText: 'Ümumi şagird sayını daxil edin',
    defaultValue: '',
    validation: { 
      required: true,
      min: 0 
    },
    status: 'active',
    orderIndex: 2,
    order: 2
  },
  {
    id: 'col-3',
    name: 'Müəllim sayı',
    type: 'number',
    categoryId: 'cat-2',
    isRequired: true,
    options: [],
    placeholder: 'Müəllim sayını daxil edin',
    helpText: 'Ümumi müəllim sayını daxil edin',
    defaultValue: '',
    validation: { 
      required: true,
      min: 0 
    },
    status: 'active',
    orderIndex: 1,
    order: 1
  }
];

// Kateqoriya statusları
export const statusFilters = [
  { value: "all", label: "Hamısı" },
  { value: "active", label: "Aktiv" },
  { value: "inactive", label: "Qeyri-aktiv" },
  { value: "archived", label: "Arxivlənmiş" }
];

// Məktəb məlumatları
export const schoolData: CategoryEntryData[] = [
  {
    id: "entry-1",
    categoryId: "cat-1",
    categoryName: "Ümumi Məlumatlar",
    status: "draft",
    entries: {
      "col-1": "20 saylı tam orta məktəb",
      "col-2": "1200",
      "col-3": "60"
    }
  },
  {
    id: "entry-2",
    categoryId: "cat-2",
    categoryName: "Şagird Məlumatları",
    status: "pending",
    entries: {
      "col-4": "600",
      "col-5": "600",
    }
  }
];
