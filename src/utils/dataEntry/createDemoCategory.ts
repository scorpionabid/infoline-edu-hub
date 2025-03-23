
import { CategoryWithColumns, Column } from '@/types/column';
import { v4 as uuidv4 } from 'uuid';
import { CategoryEntryData } from '@/types/dataEntry';

/**
 * Demo kateqoriya yaratmaq üçün funksiya
 * 
 * @returns Yaradılan demo kateqoriya
 */
export const createDemoCategory = (): CategoryWithColumns => {
  const categoryId = uuidv4();
  
  // Tələbə məlumatları kateqoriyasını yaradaq
  return {
    id: categoryId,
    name: "Tələbə məlumatları",
    description: "Məktəbdəki tələbələr haqqında əsas məlumatlar",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 həftə sonra
    status: "active",
    assignment: "all", // Bütün məktəblərə aid
    createdAt: new Date().toISOString(), // createdAt üçün cari tarixi string formatında istifadə edirik
    columns: [
      // Tələbə sayı sütunu
      {
        id: uuidv4(),
        categoryId,
        name: "Tələbə sayı",
        type: "number",
        isRequired: true,
        placeholder: "Məktəbdəki cəmi tələbə sayını daxil edin",
        helpText: "Bura ümumi say daxil edilməlidir, siniflər üzrə bölünməməlidir",
        order: 1,
        status: "active",
        validation: {
          minValue: 0,
          maxValue: 5000
        },
        // validationRules əvəzinə validation istifadə edək
        validationRules: {
          min: 0,
          max: 5000,
          required: true
        }
      },
      
      // Qız tələbə sayı
      {
        id: uuidv4(),
        categoryId,
        name: "Qız tələbə sayı",
        type: "number",
        isRequired: true,
        placeholder: "Məktəbdəki qız tələbələrin sayını daxil edin",
        helpText: "Bura qız şagirdlərin ümumi sayı daxil edilməlidir",
        order: 2,
        status: "active",
        validation: {
          minValue: 0,
          maxValue: 3000
        },
        // validationRules əvəzinə validation istifadə edək
        validationRules: {
          min: 0,
          max: 3000,
          required: true
        }
      },
      
      // Əlavə qeydlər
      {
        id: uuidv4(),
        categoryId,
        name: "Əlavə qeydlər",
        type: "textarea",
        isRequired: false,
        placeholder: "Əlavə qeydləri buraya yazın",
        helpText: "Tələbələrlə bağlı vacib qeydləri buraya əlavə edə bilərsiniz",
        order: 3,
        status: "active",
        multiline: true // textarea üçün multiline xüsusiyyətini true edək
      }
    ]
  };
};

/**
 * İkinci demo kateqoriya yaratmaq üçün funksiya - bu dəfə müəllim məlumatları
 * 
 * @returns Yaradılan demo kateqoriya
 */
export const createTeachersDemoCategory = (): CategoryWithColumns => {
  const categoryId = uuidv4();
  
  // Müəllim məlumatları kateqoriyasını yaradaq
  return {
    id: categoryId,
    name: "Müəllim məlumatları",
    description: "Məktəbdəki müəllimlər haqqında əsas məlumatlar",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 gün sonra
    status: "active",
    assignment: "sectors", // Sektorlar üçün nəzərdə tutulmuş
    createdAt: new Date().toISOString(), // createdAt üçün cari tarixi string formatında istifadə edirik
    columns: [
      // Müəllim sayı sütunu
      {
        id: uuidv4(),
        categoryId,
        name: "Müəllim sayı",
        type: "number",
        isRequired: true,
        placeholder: "Məktəbdəki cəmi müəllim sayını daxil edin",
        helpText: "Bura ümumi say daxil edilməlidir",
        order: 1,
        status: "active",
        validation: {
          minValue: 0,
          maxValue: 1000
        },
        // validationRules əvəzinə validation istifadə edək
        validationRules: {
          min: 0,
          max: 1000,
          required: true
        }
      },
      
      // Ali təhsilli müəllim sayı
      {
        id: uuidv4(),
        categoryId,
        name: "Ali təhsilli müəllim sayı",
        type: "number",
        isRequired: true,
        placeholder: "Ali təhsilli müəllimlərin sayını daxil edin",
        helpText: "Yalnız ali təhsili olan müəllimlər daxil edilməlidir",
        order: 2,
        status: "active",
        validation: {
          minValue: 0,
          maxValue: 1000
        },
        // validationRules əvəzinə validation istifadə edək
        validationRules: {
          min: 0,
          max: 1000,
          required: true
        }
      },
      
      // Əlavə qeydlər
      {
        id: uuidv4(),
        categoryId,
        name: "Əlavə qeydlər",
        type: "textarea",
        isRequired: false,
        placeholder: "Əlavə qeydləri buraya yazın",
        helpText: "Müəllimlərlə bağlı vacib qeydləri buraya əlavə edə bilərsiniz",
        order: 3,
        status: "active",
        multiline: true // textarea üçün multiline xüsusiyyətini true edək
      }
    ]
  };
};

/**
 * Yaradılmış demo kateqoriyalara id əlavə et
 * 
 * @param categories Mövcud kateqoriyalar
 * @returns Id ilə yaradılmış kateqoriyalar
 */
export const addIdsToCategories = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return categories.map((category) => {
    // Əgər kateqoriyanın id-si artıq varsa, heç nə dəyişdirmirik
    if (category.id) return category;
    
    // Əgər yoxdursa, id əlavə edirik
    const categoryId = uuidv4();
    
    return {
      ...category,
      id: categoryId,
      columns: category.columns.map((column) => ({
        ...column,
        id: column.id || uuidv4(),
        categoryId: column.categoryId || categoryId
      }))
    };
  });
};

/**
 * Çoxlu demo kateqoriyalar yaratmaq üçün funksiya
 */
export const createDemoCategories = (): CategoryWithColumns[] => {
  return [createDemoCategory(), createTeachersDemoCategory()];
};

/**
 * Kateqoriyalar üçün ilkin məlumatları yaratmaq
 */
export const createInitialEntries = (categories: CategoryWithColumns[]): CategoryEntryData[] => {
  return categories.map(category => {
    const entries: CategoryEntryData = {
      categoryId: category.id || '',
      status: 'draft',
      values: {}
    };
    
    // Hər bir sütun üçün boş dəyər təyin edək
    category.columns.forEach(column => {
      if (column.defaultValue !== undefined) {
        entries.values[column.id] = column.defaultValue;
      } else {
        switch (column.type) {
          case 'number':
            entries.values[column.id] = '';
            break;
          case 'checkbox':
            entries.values[column.id] = false;
            break;
          case 'boolean':
            entries.values[column.id] = false;
            break;
          default:
            entries.values[column.id] = '';
        }
      }
    });
    
    return entries;
  });
};
