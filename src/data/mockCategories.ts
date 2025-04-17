
import { v4 as uuidv4 } from 'uuid';
import { Category } from '@/types/category';  // yeni import
import { Column } from '@/types/column';

// Mock Column data
export const mockColumns: Column[] = [
  {
    id: "col1",
    category_id: "cat1",
    name: "Məktəb tipi",
    type: "select",
    is_required: true,
    placeholder: "Məktəb tipini seçin",
    help_text: "Məktəbin tam orta, ümumi orta və s.",
    order_index: 1,
    status: "active",
    parent_column_id: null,
    validation: {},
    options: [
      { value: "full_secondary", label: "Tam orta məktəb" },
      { value: "general_secondary", label: "Ümumi orta məktəb" },
      { value: "primary", label: "İbtidai məktəb" },
      { value: "lyceum", label: "Lisey" },
      { value: "gymnasium", label: "Gimnaziya" }
    ],
    created_at: "2023-09-01T12:00:00Z",
    updated_at: "2023-09-01T12:00:00Z"
  },
  {
    id: "col2",
    category_id: "cat1",
    name: "Şagird sayı",
    type: "number",
    is_required: true,
    placeholder: "Şagird sayını daxil edin",
    order_index: 2,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 10000
    },
    created_at: "2023-09-01T12:10:00Z",
    updated_at: "2023-09-01T12:10:00Z"
  },
  {
    id: "col3",
    category_id: "cat1",
    name: "Müəllim sayı",
    type: "number",
    is_required: true,
    placeholder: "Müəllim sayını daxil edin",
    order_index: 3,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 1000
    },
    created_at: "2023-09-01T12:20:00Z",
    updated_at: "2023-09-01T12:20:00Z"
  },
  {
    id: "col4",
    category_id: "cat1",
    name: "Təlimat dili",
    type: "select",
    is_required: true,
    placeholder: "Təlimat dilini seçin",
    order_index: 4,
    status: "active",
    parent_column_id: null,
    options: [
      { value: "azerbaijani", label: "Azərbaycan dili" },
      { value: "russian", label: "Rus dili" },
      { value: "english", label: "İngilis dili" }
    ],
    created_at: "2023-09-01T12:30:00Z",
    updated_at: "2023-09-01T12:30:00Z"
  },
  {
    id: "col5",
    category_id: "cat1",
    name: "Qeydiyyat tarixi",
    type: "date",
    is_required: false,
    placeholder: "Məktəbin qeydiyyat tarixini daxil edin",
    order_index: 5,
    status: "active",
    parent_column_id: null,
    created_at: "2023-09-01T12:40:00Z",
    updated_at: "2023-09-01T12:40:00Z"
  },
  {
    id: "col6",
    category_id: "cat2",
    name: "Sinif otaqlarının sayı",
    type: "number",
    is_required: true,
    placeholder: "Sinif otaqlarının sayını daxil edin",
    order_index: 1,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 100
    },
    created_at: "2023-09-02T10:00:00Z",
    updated_at: "2023-09-02T10:00:00Z"
  },
  {
    id: "col7",
    category_id: "cat2",
    name: "Laboratoriyaların sayı",
    type: "number",
    is_required: true,
    placeholder: "Laboratoriyaların sayını daxil edin",
    order_index: 2,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 20
    },
    created_at: "2023-09-02T10:10:00Z",
    updated_at: "2023-09-02T10:10:00Z"
  },
  {
    id: "col8",
    category_id: "cat2",
    name: "İdman zalı",
    type: "select",
    is_required: true,
    placeholder: "İdman zalı varmı?",
    order_index: 3,
    status: "active",
    parent_column_id: null,
    options: [
      { value: "yes", label: "Bəli" },
      { value: "no", label: "Xeyr" }
    ],
    created_at: "2023-09-02T10:20:00Z",
    updated_at: "2023-09-02T10:20:00Z"
  },
  {
    id: "col9",
    category_id: "cat2",
    name: "Kitabxana",
    type: "select",
    is_required: true,
    placeholder: "Kitabxana varmı?",
    order_index: 4,
    status: "active",
    parent_column_id: null,
    options: [
      { value: "yes", label: "Bəli" },
      { value: "no", label: "Xeyr" }
    ],
    created_at: "2023-09-02T10:30:00Z",
    updated_at: "2023-09-02T10:30:00Z"
  },
  {
    id: "col10",
    category_id: "cat2",
    name: "Əlavə qeydlər",
    type: "textarea",
    is_required: false,
    placeholder: "Əlavə məlumatlar",
    order_index: 5,
    status: "active",
    parent_column_id: null,
    created_at: "2023-09-02T10:40:00Z",
    updated_at: "2023-09-02T10:40:00Z"
  },
  {
    id: "col11",
    category_id: "cat3",
    name: "İnformatika kabinetlərinin sayı",
    type: "number",
    is_required: true,
    placeholder: "İnformatika kabinetlərinin sayını daxil edin",
    order_index: 1,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 10
    },
    created_at: "2023-09-03T09:00:00Z",
    updated_at: "2023-09-03T09:00:00Z"
  },
  {
    id: "col12",
    category_id: "cat3",
    name: "Kompüterlərin sayı",
    type: "number",
    is_required: true,
    placeholder: "Kompüterlərin sayını daxil edin",
    order_index: 2,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 200
    },
    created_at: "2023-09-03T09:10:00Z",
    updated_at: "2023-09-03T09:10:00Z"
  },
  {
    id: "col13",
    category_id: "cat3",
    name: "İnternet bağlantısı",
    type: "select",
    is_required: true,
    placeholder: "İnternet bağlantısı varmı?",
    order_index: 3,
    status: "active",
    parent_column_id: null,
    options: [
      { value: "yes", label: "Bəli" },
      { value: "no", label: "Xeyr" }
    ],
    created_at: "2023-09-03T09:20:00Z",
    updated_at: "2023-09-03T09:20:00Z"
  },
  {
    id: "col14",
    category_id: "cat3",
    name: "Proyektorların sayı",
    type: "number",
    is_required: true,
    placeholder: "Proyektorların sayını daxil edin",
    order_index: 4,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 50
    },
    created_at: "2023-09-03T09:30:00Z",
    updated_at: "2023-09-03T09:30:00Z"
  },
  {
    id: "col15",
    category_id: "cat3",
    name: "Əlavə qeydlər",
    type: "textarea",
    is_required: false,
    placeholder: "Əlavə məlumatlar",
    order_index: 5,
    status: "active",
    parent_column_id: null,
    created_at: "2023-09-03T09:40:00Z",
    updated_at: "2023-09-03T09:40:00Z"
  },
  {
    id: "col16",
    category_id: "cat4",
    name: "İngilis dili müəllimlərinin sayı",
    type: "number",
    is_required: true,
    placeholder: "İngilis dili müəllimlərinin sayını daxil edin",
    order_index: 1,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 30
    },
    created_at: "2023-09-04T11:00:00Z",
    updated_at: "2023-09-04T11:00:00Z"
  },
  {
    id: "col17",
    category_id: "cat4",
    name: "Rus dili müəllimlərinin sayı",
    type: "number",
    is_required: true,
    placeholder: "Rus dili müəllimlərinin sayını daxil edin",
    order_index: 2,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 30
    },
    created_at: "2023-09-04T11:10:00Z",
    updated_at: "2023-09-04T11:10:00Z"
  },
  {
    id: "col18",
    category_id: "cat4",
    name: "Digər xarici dil müəllimlərinin sayı",
    type: "number",
    is_required: false,
    placeholder: "Digər xarici dil müəllimlərinin sayını daxil edin",
    order_index: 3,
    status: "active",
    parent_column_id: null,
    validation: {
      min: 0,
      max: 20
    },
    created_at: "2023-09-04T11:20:00Z",
    updated_at: "2023-09-04T11:20:00Z"
  },
  {
    id: "col19",
    category_id: "cat4",
    name: "Tədris edilən digər xarici dillər",
    type: "textarea",
    is_required: false,
    placeholder: "Tədris edilən digər xarici dilləri qeyd edin",
    order_index: 4,
    status: "active",
    parent_column_id: null,
    created_at: "2023-09-04T11:30:00Z",
    updated_at: "2023-09-04T11:30:00Z"
  },
  {
    id: "col20",
    category_id: "cat4",
    name: "Dil laboratoriyası",
    type: "select",
    is_required: true,
    placeholder: "Dil laboratoriyası varmı?",
    order_index: 5,
    status: "active",
    parent_column_id: null,
    options: [
      { value: "yes", label: "Bəli" },
      { value: "no", label: "Xeyr" }
    ],
    created_at: "2023-09-04T11:40:00Z",
    updated_at: "2023-09-04T11:40:00Z"
  },
  {
    id: "col21",
    category_id: "cat5",
    name: "Direktor adı",
    type: "text",
    is_required: true,
    placeholder: "Direktor adını daxil edin",
    order_index: 1,
    status: "active",
    parent_column_id: null,
    created_at: "2023-09-05T13:00:00Z",
    updated_at: "2023-09-05T13:00:00Z"
  },
  {
    id: "col22",
    category_id: "cat5",
    name: "Direktor telefon",
    type: "text",
    is_required: true,
    placeholder: "Direktor telefon nömrəsini daxil edin",
    order_index: 2,
    status: "active",
    parent_column_id: null,
    created_at: "2023-09-05T13:10:00Z",
    updated_at: "2023-09-05T13:10:00Z"
  },
  {
    id: "col23",
    category_id: "cat5",
    name: "Direktor e-poçt",
    type: "text",
    is_required: false,
    placeholder: "Direktor e-poçt ünvanını daxil edin",
    order_index: 3,
    status: "active",
    parent_column_id: null,
    created_at: "2023-09-05T13:20:00Z",
    updated_at: "2023-09-05T13:20:00Z"
  },
  {
    id: "col24",
    category_id: "cat5",
    name: "Təhsil üzrə müavin adı",
    type: "text",
    is_required: false,
    placeholder: "Təhsil üzrə müavin adını daxil edin",
    order_index: 4,
    status: "active",
    parent_column_id: null,
    created_at: "2023-09-05T13:30:00Z",
    updated_at: "2023-09-05T13:30:00Z"
  },
  {
    id: "col25",
    category_id: "cat5",
    name: "Təhsil üzrə müavin telefon",
    type: "text",
    is_required: false,
    placeholder: "Təhsil üzrə müavin telefon nömrəsini daxil edin",
    order_index: 5,
    status: "active",
    parent_column_id: null,
    created_at: "2023-09-05T13:40:00Z",
    updated_at: "2023-09-05T13:40:00Z"
  }
];

// Filter columns by category ID
export const getColumnsByCategoryId = (categoryId: string) => {
  return mockColumns.filter(column => column.category_id === categoryId);
};

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: "cat1",
    name: "Ümumi məlumatlar",
    description: "Məktəb haqqında əsas məlumatlar",
    assignment: "all",
    deadline: "2023-12-01",
    status: "active",
    priority: 5,
    created_at: "2023-09-01T10:00:00Z",
    updated_at: "2023-09-01T10:00:00Z",
    archived: false,
    column_count: getColumnsByCategoryId("cat1").length,
    columns: getColumnsByCategoryId("cat1"),
    completionPercentage: 0
  },
  {
    id: "cat2",
    name: "İnfrastruktur",
    description: "Məktəb infrastrukturu haqqında məlumatlar",
    assignment: "all",
    deadline: "2023-12-15",
    status: "active",
    priority: 4,
    created_at: "2023-09-02T09:00:00Z",
    updated_at: "2023-09-02T09:00:00Z",
    archived: false,
    column_count: getColumnsByCategoryId("cat2").length,
    columns: getColumnsByCategoryId("cat2"),
    completionPercentage: 0
  },
  {
    id: "cat3",
    name: "İKT",
    description: "İnformasiya-kommunikasiya texnologiyaları haqqında məlumatlar",
    assignment: "sectors",
    deadline: "2023-12-20",
    status: "active",
    priority: 3,
    created_at: "2023-09-03T08:00:00Z",
    updated_at: "2023-09-03T08:00:00Z",
    archived: false,
    column_count: getColumnsByCategoryId("cat3").length,
    columns: getColumnsByCategoryId("cat3"),
    completionPercentage: 0
  },
  {
    id: "cat4",
    name: "Xarici dillər",
    description: "Xarici dillərin tədrisi haqqında məlumatlar",
    assignment: "all",
    deadline: "2023-12-25",
    status: "active",
    priority: 2,
    created_at: "2023-09-04T10:00:00Z",
    updated_at: "2023-09-04T10:00:00Z",
    archived: false,
    column_count: getColumnsByCategoryId("cat4").length,
    columns: getColumnsByCategoryId("cat4"),
    completionPercentage: 0
  },
  {
    id: "cat5",
    name: "Rəhbərlik",
    description: "Məktəb rəhbərliyi haqqında məlumatlar",
    assignment: "sectors",
    deadline: "2024-01-10",
    status: "active",
    priority: 1,
    created_at: "2023-09-05T12:00:00Z",
    updated_at: "2023-09-05T12:00:00Z",
    archived: false,
    column_count: getColumnsByCategoryId("cat5").length,
    columns: getColumnsByCategoryId("cat5"),
    completionPercentage: 0
  }
];

// Mock Category & Columns helper
export const getCategoryWithColumns = (categoryId: string) => {
  const category = mockCategories.find(cat => cat.id === categoryId);
  if (!category) return null;
  
  const columns = getColumnsByCategoryId(categoryId);
  
  return {
    ...category,
    columns
  };
};
