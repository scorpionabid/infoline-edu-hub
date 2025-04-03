
import { Category } from '@/types/category';
import { CategoryEntryData } from '@/types/dataEntry';
import { Column } from '@/types/column';
import { getMockCategories, mockSchools } from './mock';

// Sadə kateqoriyalar
export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Ümumi Məlumatlar",
    description: "Məktəb haqqında ümumi məlumatlar",
    status: "active",
    assignment: "all",
    priority: 1,
  },
  {
    id: "cat-2",
    name: "Şagird Məlumatları",
    description: "Şagirdlər barədə məlumatlar",
    status: "active",
    assignment: "all",
    priority: 2,
  },
  {
    id: "cat-3",
    name: "Müəllim Məlumatları",
    description: "Müəllimlər haqqında məlumatlar",
    status: "active",
    assignment: "all",
    priority: 3,
  },
  {
    id: "cat-4",
    name: "Təhsil Proqramı",
    description: "Tədris proqramı və kurikulum",
    status: "active",
    assignment: "sectors",
    priority: 4,
  },
  {
    id: "cat-5",
    name: "İnfrastruktur",
    description: "Məktəbin infrastrukturu haqqında məlumatlar",
    status: "active",
    assignment: "all",
    priority: 5,
  }
];

// Sütunlar
export const columns: Column[] = [
  {
    id: "col-1",
    name: "Məktəbin adı",
    type: "text",
    categoryId: "cat-1",
    isRequired: true,
    placeholder: "Məktəbin adını daxil edin",
    helpText: "Məktəbin rəsmi adını tam şəkildə daxil edin",
    defaultValue: "",
    validation: { required: true, minLength: 3, maxLength: 100 },
    status: "active",
    orderIndex: 1,
    order: 1
  },
  {
    id: "col-2",
    name: "Şagird sayı",
    type: "number",
    categoryId: "cat-1",
    isRequired: true,
    placeholder: "Şagird sayını daxil edin",
    helpText: "Məktəbdə təhsil alan şagirdlərin ümumi sayı",
    defaultValue: "",
    validation: { required: true, min: 0 },
    status: "active",
    orderIndex: 2,
    order: 2
  },
  {
    id: "col-3",
    name: "Müəllim sayı",
    type: "number",
    categoryId: "cat-1",
    isRequired: true,
    placeholder: "Müəllim sayını daxil edin",
    helpText: "Məktəbdə çalışan müəllimlərin sayı",
    defaultValue: "",
    validation: { required: true, min: 0 },
    status: "active",
    orderIndex: 3,
    order: 3
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
