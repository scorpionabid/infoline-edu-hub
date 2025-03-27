
import { CategoryWithColumns } from '@/types/column';

// Mock kateqoriyalar və sütunlar
export const categories: CategoryWithColumns[] = [
  {
    id: "cat1",
    name: "Ümumi məlumatlar",
    description: "Məktəbin əsas statistik göstəriciləri haqqında məlumatlar",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 gün sonra
    status: "active",
    priority: 1,
    assignment: "all",
    createdAt: new Date().toISOString(),
    columns: [
      { 
        id: "col1", 
        categoryId: "cat1", 
        name: "Şagird sayı", 
        type: "number", 
        isRequired: true, 
        order: 1, 
        status: "active",
        helpText: "Məktəbdə təhsil alan bütün şagirdlərin sayı", 
        validationRules: { minValue: 0, maxValue: 5000 }
      },
      { 
        id: "col2", 
        categoryId: "cat1", 
        name: "Müəllim sayı", 
        type: "number", 
        isRequired: true, 
        order: 2, 
        status: "active",
        helpText: "Məktəbdə çalışan bütün müəllimlərin sayı", 
        validationRules: { minValue: 0, maxValue: 500 }
      },
      { 
        id: "col3", 
        categoryId: "cat1", 
        name: "Sinif otaqlarının sayı", 
        type: "number", 
        isRequired: true, 
        order: 3, 
        status: "active",
        helpText: "Tədris məqsədlə istifadə olunan sinif otaqlarının sayı", 
        validationRules: { minValue: 0 }
      },
      { 
        id: "col4", 
        categoryId: "cat1", 
        name: "Kompüter otaqlarının sayı", 
        type: "number", 
        isRequired: false, 
        order: 4, 
        status: "active",
        helpText: "İnformatika dərsləri üçün nəzərdə tutulmuş kompüter otaqlarının sayı"
      }
    ]
  },
  {
    id: "cat2",
    name: "Tədris məlumatları",
    description: "Məktəbin tədris fəaliyyəti ilə bağlı məlumatlar",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 gün sonra
    status: "active",
    priority: 2,
    assignment: "all",
    createdAt: new Date().toISOString(),
    columns: [
      { 
        id: "col5", 
        categoryId: "cat2", 
        name: "Tədris dili", 
        type: "select", 
        isRequired: true, 
        options: ["Azərbaycan", "Rus", "İngilis", "Qarışıq"], 
        order: 1, 
        status: "active",
        helpText: "Məktəbdə əsas tədris dili"
      },
      { 
        id: "col6", 
        categoryId: "cat2", 
        name: "Tədris proqramı", 
        type: "text", 
        isRequired: true, 
        order: 2, 
        status: "active",
        multiline: true,
        helpText: "Məktəbin istifadə etdiyi əsas tədris proqramı(ları)"
      },
      { 
        id: "col7", 
        categoryId: "cat2", 
        name: "Təhsil növü", 
        type: "select", 
        isRequired: true, 
        options: ["Tam orta", "Ümumi orta", "İbtidai", "Qarışıq"], 
        order: 3, 
        status: "active",
        helpText: "Məktəbdə verilən təhsilin növü"
      }
    ]
  },
  {
    id: "cat3",
    name: "İnfrastruktur",
    description: "Məktəb binası və infrastrukturu haqqında məlumatlar",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün sonra
    status: "active",
    priority: 3,
    assignment: "all",
    createdAt: new Date().toISOString(),
    columns: [
      { 
        id: "col8", 
        categoryId: "cat3", 
        name: "İdman zalı", 
        type: "checkbox", 
        isRequired: false, 
        order: 1, 
        status: "active",
        placeholder: "Məktəbdə idman zalı mövcuddur",
        helpText: "İdman zalının olub-olmadığını qeyd edin"
      },
      { 
        id: "col9", 
        categoryId: "cat3", 
        name: "Kitabxana", 
        type: "checkbox", 
        isRequired: false, 
        order: 2, 
        status: "active",
        placeholder: "Məktəbdə kitabxana mövcuddur", 
        helpText: "Kitabxananın olub-olmadığını qeyd edin"
      },
      { 
        id: "col10", 
        categoryId: "cat3", 
        name: "Yeməkxana", 
        type: "checkbox", 
        isRequired: false, 
        order: 3, 
        status: "active",
        placeholder: "Məktəbdə yeməkxana mövcuddur", 
        helpText: "Yeməkxananın olub-olmadığını qeyd edin"
      },
      { 
        id: "col11", 
        categoryId: "cat3", 
        name: "Binanın vəziyyəti", 
        type: "select", 
        isRequired: true, 
        options: ["Əla", "Yaxşı", "Kafi", "Qənaətbəxş deyil"], 
        order: 4, 
        status: "active",
        helpText: "Məktəb binasının ümumi vəziyyətini qiymətləndirin"
      },
      { 
        id: "col12", 
        categoryId: "cat3", 
        name: "Son təmir tarixi", 
        type: "date", 
        isRequired: true, 
        order: 5, 
        status: "active",
        helpText: "Məktəbdə son təmir işlərinin aparıldığı tarix"
      }
    ]
  },
  {
    id: "cat4",
    name: "Digər məlumatlar",
    description: "Əlavə məlumatlar və qeydlər",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 gün sonra
    status: "active",
    priority: 4,
    assignment: "all",
    createdAt: new Date().toISOString(),
    columns: [
      { 
        id: "col13", 
        categoryId: "cat4", 
        name: "Əlavə qeydlər", 
        type: "text", 
        isRequired: false, 
        order: 1, 
        status: "active",
        multiline: true,
        helpText: "Məktəb haqqında əlavə qeydlər və məlumatlar"
      },
      { 
        id: "col14", 
        categoryId: "cat4", 
        name: "Təklif və rəylər", 
        type: "text", 
        isRequired: false, 
        order: 2, 
        status: "active",
        multiline: true,
        helpText: "Tədris prosesinin inkişafı üçün təkliflər"
      }
    ]
  },
  {
    id: "cat5",
    name: "Yeni kateqoriya",
    description: "Bu kateqoriya yeni əlavə edilib və doldurulması tələb olunur",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün sonra
    status: "active",
    priority: 5,
    assignment: "all",
    createdAt: new Date().toISOString(),
    columns: [
      { 
        id: "col15", 
        categoryId: "cat5", 
        name: "Yeni əlavə olunmuş field", 
        type: "text", 
        isRequired: true, 
        order: 1, 
        status: "active",
        helpText: "Bu field yeni əlavə olunub və mütləq doldurulmalıdır", 
      },
      { 
        id: "col16", 
        categoryId: "cat5", 
        name: "İkinci yeni field", 
        type: "select", 
        isRequired: true, 
        options: ["Seçim 1", "Seçim 2", "Seçim 3"], 
        order: 2, 
        status: "active",
        helpText: "Bu da yeni əlavə olunmuş seçim sahəsidir"
      }
    ]
  }
];

// Əvvəlki versiya ilə uyğunluq üçün bu export əlavə edirik
export const mockCategories = categories;

// Sütun tipinə görə ilkin dəyər təyin etmək
export const getDefaultValueByType = (type: string, defaultValue?: string) => {
  switch (type) {
    case 'number':
      return defaultValue ? Number(defaultValue) : '';
    case 'checkbox':
      return defaultValue === 'true';
    case 'date':
      return defaultValue ? new Date(defaultValue) : '';
    case 'select':
      return defaultValue || '';
    default:
      return defaultValue || '';
  }
};
