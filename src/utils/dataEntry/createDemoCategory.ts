
import { CategoryWithColumns } from "@/types/column";

// Demo kateqoriya və sütun yaratmaq üçün köməkçi funksiya
export function createDemoCategory(): CategoryWithColumns {
  // Demo kateqoriyanı yaradırıq
  return {
    category: {
      id: 'demo-cat-1',
      name: 'Demo Məktəb Məlumatları',
      description: 'Bu demo məlumatlar kateqoriyasıdır',
      order: 1,
      priority: 1,
      status: 'active',
      assignment: 'all',
      deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 həftə sonra
    },
    columns: [
      {
        id: 'demo-col-1',
        name: 'Şagird sayı',
        type: 'number',
        categoryId: 'demo-cat-1',
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
        id: 'demo-col-2',
        name: 'Məktəb növü',
        type: 'select',
        categoryId: 'demo-cat-1',
        isRequired: true,
        options: [
          { value: 'tam', label: 'Tam orta məktəb' },
          { value: 'umumi', label: 'Ümumi orta məktəb' },
          { value: 'ibtidai', label: 'İbtidai məktəb' }
        ],
        order: 2,
        orderIndex: 2,
        status: 'active',
      },
      {
        id: 'demo-col-3',
        name: 'İnternet mövcuddur',
        type: 'checkbox',
        categoryId: 'demo-cat-1',
        isRequired: true,
        order: 3,
        orderIndex: 3,
        status: 'active'
      },
      {
        id: 'demo-col-4',
        name: 'Qeydlər',
        type: 'textarea',
        categoryId: 'demo-cat-1',
        isRequired: false,
        order: 4,
        orderIndex: 4,
        status: 'active'
      }
    ],
    id: 'demo-cat-1',
    name: 'Demo Məktəb Məlumatları',
    description: 'Bu demo məlumatlar kateqoriyasıdır',
    assignment: 'all',
    priority: 1,
    deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    order: 1
  };
}

// Müəllimlər demosu
export function createTeachersDemoCategory(): CategoryWithColumns {
  return {
    category: {
      id: 'demo-cat-teachers',
      name: 'Demo Müəllim Məlumatları',
      description: 'Demo müəllim məlumatları kateqoriyası',
      order: 2,
      priority: 2,
      status: 'active',
      assignment: 'all',
      deadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 həftə sonra
    },
    columns: [
      {
        id: 'demo-col-t1',
        name: 'Müəllim sayı',
        type: 'number',
        categoryId: 'demo-cat-teachers',
        isRequired: true,
        order: 1,
        orderIndex: 1,
        status: 'active',
        validation: {
          min: 0,
          max: 500
        }
      },
      {
        id: 'demo-col-t2',
        name: 'Ali təhsilli müəllim sayı',
        type: 'number',
        categoryId: 'demo-cat-teachers',
        isRequired: true,
        order: 2,
        orderIndex: 2,
        status: 'active',
        validation: {
          min: 0,
          max: 500
        }
      }
    ],
    id: 'demo-cat-teachers',
    name: 'Demo Müəllim Məlumatları',
    description: 'Demo müəllim məlumatları kateqoriyası',
    assignment: 'all',
    priority: 2,
    deadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    order: 2
  };
}

export function createDemoCategories(): CategoryWithColumns[] {
  return [createDemoCategory(), createTeachersDemoCategory()];
}
