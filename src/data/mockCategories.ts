import { Column } from '@/types/column';
import { Category, CategoryWithColumns } from '@/types/dataEntry';

// Kateqoriyalar və sütunların mock datası

export const mockColumns: Column[] = [
  {
    id: 'col1',
    category_id: 'cat1',
    name: 'Tələbə sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Tələbə sayını daxil edin',
    help_text: 'Məktəbinizdəki cari tələbə sayını daxil edin',
    order_index: 0,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 10000
    }
  },
  {
    id: 'col2',
    category_id: 'cat1',
    name: 'Qız tələbə sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Qız tələbə sayını daxil edin',
    help_text: 'Məktəbinizdəki cari qız tələbə sayını daxil edin',
    order_index: 1,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 10000
    }
  },
  {
    id: 'col3',
    category_id: 'cat1',
    name: 'Oğlan tələbə sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Oğlan tələbə sayını daxil edin',
    help_text: 'Məktəbinizdəki cari oğlan tələbə sayını daxil edin',
    order_index: 2,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 10000
    }
  },
  {
    id: 'col4',
    category_id: 'cat1',
    name: 'Əlilliyi olan tələbə sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Əlilliyi olan tələbə sayını daxil edin',
    help_text: 'Məktəbinizdəki cari əlilliyi olan tələbə sayını daxil edin',
    order_index: 3,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 10000
    }
  },
  // ... bütün digər sütunlar üçün
  {
    id: 'col5',
    category_id: 'cat2',
    name: 'Müəllim sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Müəllim sayını daxil edin',
    help_text: 'Məktəbinizdəki cari müəllim sayını daxil edin',
    order_index: 0,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 1000
    }
  },
  {
    id: 'col6',
    category_id: 'cat2',
    name: 'Qadın müəllim sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Qadın müəllim sayını daxil edin',
    help_text: 'Məktəbinizdəki cari qadın müəllim sayını daxil edin',
    order_index: 1,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 1000
    }
  },
  {
    id: 'col7',
    category_id: 'cat2',
    name: 'Kişi müəllim sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Kişi müəllim sayını daxil edin',
    help_text: 'Məktəbinizdəki cari kişi müəllim sayını daxil edin',
    order_index: 2,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 1000
    }
  },
  {
    id: 'col8',
    category_id: 'cat2',
    name: 'Ali təhsilli müəllim sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Ali təhsilli müəllim sayını daxil edin',
    help_text: 'Məktəbinizdəki cari ali təhsilli müəllim sayını daxil edin',
    order_index: 3,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 1000
    }
  },
  {
    id: 'col9',
    category_id: 'cat2',
    name: 'Orta-ixtisas təhsilli müəllim sayı',
    type: 'number',
    is_required: false,
    placeholder: 'Orta-ixtisas təhsilli müəllim sayını daxil edin',
    help_text: 'Məktəbinizdəki cari orta-ixtisas təhsilli müəllim sayını daxil edin',
    order_index: 4,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 1000
    }
  },
  // Təhsil səviyyəsi kateqoriyası üçün sütunlar
  {
    id: 'col10',
    category_id: 'cat3',
    name: 'Siniflərin ümumi sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Siniflərin ümumi sayını daxil edin',
    help_text: 'Məktəbinizdəki cari siniflərin ümumi sayını daxil edin',
    order_index: 0,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 100
    }
  },
  {
    id: 'col11',
    category_id: 'cat3',
    name: 'İbtidai siniflərin sayı (1-4)',
    type: 'number',
    is_required: true,
    placeholder: 'İbtidai siniflərin sayını daxil edin',
    help_text: 'Məktəbinizdəki cari ibtidai siniflərin sayını daxil edin',
    order_index: 1,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 50
    }
  },
  {
    id: 'col12',
    category_id: 'cat3',
    name: 'Orta siniflərin sayı (5-9)',
    type: 'number',
    is_required: true,
    placeholder: 'Orta siniflərin sayını daxil edin',
    help_text: 'Məktəbinizdəki cari orta siniflərin sayını daxil edin',
    order_index: 2,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 50
    }
  },
  {
    id: 'col13',
    category_id: 'cat3',
    name: 'Yuxarı siniflərin sayı (10-11)',
    type: 'checkbox',
    is_required: true,
    help_text: 'Məktəbinizdəki cari yuxarı siniflərin sayını daxil edin',
    order_index: 3,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [
      { label: 'Var', value: 'true' },
      { label: 'Yoxdur', value: 'false' }
    ],
    validation: {}
  },
  // Digər kateqoriya sütunları...
  {
    id: 'col14',
    category_id: 'cat4',
    name: 'Kabinet sayı',
    type: 'number',
    is_required: true,
    placeholder: 'Kabinet sayını daxil edin',
    help_text: 'Məktəbinizdəki cari kabinet sayını daxil edin',
    order_index: 0,
    status: 'active',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    options: [],
    validation: {
      minValue: 0,
      maxValue: 100
    }
  }
];

export const mockCategories: CategoryWithColumns[] = [
  {
    id: 'cat1',
    name: 'Şagird Statistikası',
    description: 'Məktəbinizdəki şagirdlər haqqında ümumi məlumatlar',
    assignment: 'all',
    deadline: '2024-06-30T23:59:59Z',
    status: 'active',
    priority: 1,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    archived: false,
    column_count: 4,
    columns: mockColumns.filter(col => col.category_id === 'cat1')
  },
  {
    id: 'cat2',
    name: 'Müəllim heyəti',
    description: 'Məktəbinizdəki müəllim heyəti haqqında məlumatlar',
    assignment: 'all',
    deadline: '2024-06-30T23:59:59Z',
    status: 'active',
    priority: 2,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    archived: false,
    column_count: 5,
    columns: mockColumns.filter(col => col.category_id === 'cat2')
  },
  {
    id: 'cat3',
    name: 'Təhsil Keyfiiyyət Göstəriciləri',
    description: 'Məktəbinizdəki təhsil keyfiyyəti haqqında məlumatlar',
    assignment: 'sectors',
    deadline: '2024-07-15T23:59:59Z',
    status: 'active',
    priority: 3,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    archived: false,
    column_count: 4,
    columns: mockColumns.filter(col => col.category_id === 'cat3')
  },
  {
    id: 'cat4',
    name: 'Maddi-Texniki Baza',
    description: 'Məktəbinizdəki maddi-texniki baza haqqında məlumatlar',
    assignment: 'all',
    deadline: '2024-07-30T23:59:59Z',
    status: 'active',
    priority: 4,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    archived: false,
    column_count: 1,
    columns: mockColumns.filter(col => col.category_id === 'cat4')
  },
  {
    id: 'cat5',
    name: 'Sektorlara aid kateqoriya',
    description: 'Bu kateqoriya yalnız sektorlar üçün əlçatandır',
    assignment: 'sectors',
    deadline: '2024-08-15T23:59:59Z',
    status: 'active',
    priority: 5,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    archived: false,
    column_count: 0,
    columns: mockColumns.filter(col => col.category_id === 'cat5')
  }
];

export default mockCategories;
