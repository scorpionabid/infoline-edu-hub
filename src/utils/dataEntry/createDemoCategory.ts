
import { CategoryWithColumns, Column } from '@/types/column';
import { ColumnOption } from '@/types/column';

// Function to create a demo category for testing
export const createDemoCategory = (): CategoryWithColumns => {
  return {
    id: 'demo-category',
    name: 'Ümumi məlumatlar',
    description: 'Məktəb haqqında ümumi məlumatlar',
    assignment: 'all',
    priority: 1,
    deadline: new Date().toISOString(),
    status: 'active',
    order: 1,
    columns: [
      {
        id: 'col1',
        categoryId: 'demo-category',
        name: 'Şagird sayı',
        type: 'number',
        isRequired: true,
        order: 1,
        orderIndex: 1,
        status: 'active',
        validation: {
          min: 0,
          max: 10000
        }
      },
      {
        id: 'col2',
        categoryId: 'demo-category',
        name: 'Müəllim sayı',
        type: 'number',
        isRequired: true,
        order: 2,
        orderIndex: 2,
        status: 'active',
        validation: {
          min: 0,
          max: 1000
        }
      },
      {
        id: 'col3',
        categoryId: 'demo-category',
        name: 'Məktəb tipi',
        type: 'select',
        isRequired: true,
        order: 3,
        orderIndex: 3,
        status: 'active',
        options: [
          { label: 'İbtidai məktəb', value: 'primary' },
          { label: 'Orta məktəb', value: 'middle' },
          { label: 'Tam orta məktəb', value: 'high' }
        ]
      },
      {
        id: 'col4',
        categoryId: 'demo-category',
        name: 'Kompüter otağı varmı?',
        type: 'checkbox',
        isRequired: true,
        order: 4,
        orderIndex: 4,
        status: 'active'
      },
      {
        id: 'col5',
        categoryId: 'demo-category',
        name: 'Direktoru haqqında məlumat',
        type: 'textarea',
        isRequired: false,
        order: 5,
        orderIndex: 5,
        status: 'active',
        validation: {
          maxLength: 500
        }
      }
    ]
  };
};

// Helper function to safely get the value of an option
export const getOptionValue = (option: string | ColumnOption): string => {
  if (typeof option === 'string') {
    return option;
  }
  return option.value;
};

export default createDemoCategory;
