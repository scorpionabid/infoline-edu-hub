
import { CategoryWithColumns, Column } from '@/types/column';
import { CategoryEntryData, EntryValue } from '@/types/dataEntry';
import { getDefaultValueByType } from '@/data/mockCategories';

/**
 * Demo kateqoriyalar yaradar
 */
export const createDemoCategories = (): CategoryWithColumns[] => {
  const demoCategories: CategoryWithColumns[] = [
    {
      id: "demo1",
      name: "İnfrastruktur",
      description: "Məktəbin infrastruktur məlumatları haqqında",
      assignment: "all", // assignment istifadə edirik
      status: "active",
      deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // 5 gün sonra
      createdAt: new Date().toISOString(),
      columns: [
        {
          id: "demo-col1",
          categoryId: "demo1",
          name: "Binanın vəziyyəti",
          type: "select",
          isRequired: true,
          options: ["Əla", "Yaxşı", "Qənaətbəxş", "Təmir tələb edir"],
          placeholder: "Binanın vəziyyətini seçin",
          helpText: "Məktəb binasının ümumi vəziyyətini seçin",
          order: 1,
          status: "active"
        },
        {
          id: "demo-col2",
          categoryId: "demo1",
          name: "Son təmir tarixi",
          type: "date",
          isRequired: true,
          placeholder: "Son təmir tarixini seçin",
          helpText: "Məktəbdə aparılan son təmir işlərinin tarixini qeyd edin",
          order: 2,
          status: "active"
        },
        {
          id: "demo-col3",
          categoryId: "demo1",
          name: "Sinif otaqlarının sayı",
          type: "number",
          isRequired: true,
          validationRules: {
            minValue: 1,
            maxValue: 100
          },
          placeholder: "Sinif otaqlarının sayını daxil edin",
          helpText: "Məktəbdəki ümumi sinif otaqlarının sayını daxil edin",
          order: 3,
          status: "active"
        }
      ]
    },
    {
      id: "demo2",
      name: "Tədris məlumatları",
      description: "Məktəbin tədris prosesi ilə bağlı məlumatlar",
      assignment: "all", // assignment istifadə edirik
      status: "active",
      deadline: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), // 3 gün sonra
      createdAt: new Date().toISOString(),
      columns: [
        {
          id: "demo-col4",
          categoryId: "demo2",
          name: "Tədris dili",
          type: "select",
          isRequired: true,
          options: ["Azərbaycan", "Rus", "İngilis", "Qarışıq"],
          placeholder: "Tədris dilini seçin",
          helpText: "Məktəbin əsas tədris dilini seçin",
          order: 1,
          status: "active"
        },
        {
          id: "demo-col5",
          categoryId: "demo2",
          name: "Həftəlik dərs saatları",
          type: "number",
          isRequired: true,
          validationRules: {
            minValue: 20,
            maxValue: 40
          },
          placeholder: "Həftəlik dərs saatlarını daxil edin",
          helpText: "Bir həftə ərzində keçirilən ümumi dərs saatlarını daxil edin",
          order: 2,
          status: "active"
        },
        {
          id: "demo-col6",
          categoryId: "demo2",
          name: "Əlavə təhsil proqramları",
          type: "text",
          multiline: true,
          isRequired: false,
          placeholder: "Əlavə təhsil proqramlarını daxil edin",
          helpText: "Məktəbdə tətbiq edilən əlavə təhsil proqramlarını təsvir edin",
          order: 3,
          status: "active"
        }
      ]
    }
  ];
  
  return demoCategories;
};

/**
 * Kateqoriyalar üçün ilkin məlumatlar yaradır
 */
export const createInitialEntries = (categories: CategoryWithColumns[]): CategoryEntryData[] => {
  return categories.map(category => ({
    categoryId: category.id,
    values: category.columns.map(column => ({
      columnId: column.id,
      value: getDefaultValueByType(column.type, column.defaultValue),
      status: 'pending' as 'pending' | 'approved' | 'rejected'
    })),
    isCompleted: false,
    isSubmitted: false,
    completionPercentage: 0,
    approvalStatus: 'pending' as 'pending' | 'approved' | 'rejected'
  }));
};
