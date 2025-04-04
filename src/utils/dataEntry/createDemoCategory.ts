
import { CategoryWithColumns, ColumnType } from '@/types/column';
import { generateId } from '@/utils/generateId';

export const createDemoCategories = (): CategoryWithColumns[] => {
  const t = (key: string) => key; // Lokalizasiya əvəzinə sadə funksiya

  const demoCategory1: CategoryWithColumns = {
    id: generateId(),
    name: t('demoCategory1'),
    description: t('demoCategory1Description'),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    assignment: 'all',
    createdAt: new Date().toISOString(),
    priority: 1,
    columns: [
      {
        id: generateId(),
        categoryId: '',
        name: t('demoCategory1Column1'),
        type: 'number' as ColumnType,
        isRequired: true,
        order: 1,
        status: 'active',
        helpText: t('demoCategory1Column1HelpText'),
        validationRules: { minValue: 0, maxValue: 1000 },
      },
      {
        id: generateId(),
        categoryId: '',
        name: t('demoCategory1Column2'),
        type: 'text' as ColumnType,
        isRequired: false,
        order: 2,
        status: 'active',
        helpText: t('demoCategory1Column2HelpText'),
      },
    ]
  };

  const demoCategory2: CategoryWithColumns = {
    id: generateId(),
    name: t('demoCategory2'),
    description: t('demoCategory2Description'),
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    assignment: 'sectors',
    createdAt: new Date().toISOString(),
    priority: 2,
    columns: [
      {
        id: generateId(),
        categoryId: '',
        name: t('demoCategory2Column1'),
        type: 'number' as ColumnType,
        isRequired: true,
        order: 1,
        status: 'active',
        helpText: t('demoCategory2Column1HelpText'),
        validationRules: { minValue: 0, maxValue: 500 },
      },
      {
        id: generateId(),
        categoryId: '',
        name: t('demoCategory2Column2'),
        type: 'select' as ColumnType,
        isRequired: true,
        order: 2,
        status: 'active',
        helpText: t('demoCategory2Column2HelpText'),
        options: [
          { label: t('option1'), value: 'option1' },
          { label: t('option2'), value: 'option2' },
        ],
      },
    ]
  };

  return [demoCategory1, demoCategory2];
};

// Müəllimlər üçün demo kateqoriya
export const createTeachersDemoCategory = (): CategoryWithColumns => {
  const t = (key: string) => key; // Lokalizasiya əvəzinə sadə funksiya
  
  return {
    id: generateId(),
    name: "Müəllimlər haqqında məlumat",
    description: "Məktəbin müəllim heyəti haqqında ətraflı məlumatlar",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    assignment: 'all',
    createdAt: new Date().toISOString(),
    priority: 3,
    columns: [
      {
        id: generateId(),
        categoryId: '',
        name: "Müəllimlərin ümumi sayı",
        type: 'number' as ColumnType,
        isRequired: true,
        order: 1,
        status: 'active',
        helpText: "Məktəbdə çalışan bütün müəllimlərin sayı",
        validationRules: { minValue: 0, maxValue: 1000 },
      },
      {
        id: generateId(),
        categoryId: '',
        name: "Ali təhsilli müəllimlərin sayı",
        type: 'number' as ColumnType,
        isRequired: true,
        order: 2,
        status: 'active',
        helpText: "Ali təhsilə malik müəllim sayı",
        validationRules: { minValue: 0, maxValue: 1000 },
      }
    ]
  };
};
