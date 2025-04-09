
import { CategoryWithColumns } from '@/types/column';

// Mock kateqoriyalar və sütunlar
export const mockCategoriesWithColumns: CategoryWithColumns[] = [
  {
    id: '1',
    name: 'Şagird məlumatları',
    description: 'Şagirdlərin ümumi statistik məlumatları',
    assignment: 'all',
    deadline: '2023-05-30',
    status: 'active',
    priority: 1,
    created_at: '2023-01-15',
    updated_at: '2023-01-15',
    columns: [
      {
        id: '101',
        category_id: '1',
        name: 'Şagird sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Məktəbdəki ümumi şagird sayını daxil edin',
        help_text: 'Cari təhsil ilində qeydiyyatdan keçən şagirdlərin ümumi sayı',
        order_index: 1,
        status: 'active',
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      },
      {
        id: '102',
        category_id: '1',
        name: 'Qız şagirdlərin sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Qız şagirdlərin sayını daxil edin',
        help_text: 'Cari təhsil ilində qeydiyyatdan keçən qız şagirdlərin sayı',
        order_index: 2,
        status: 'active',
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      },
      {
        id: '103',
        category_id: '1',
        name: 'Oğlan şagirdlərin sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Oğlan şagirdlərin sayını daxil edin',
        help_text: 'Cari təhsil ilində qeydiyyatdan keçən oğlan şagirdlərin sayı',
        order_index: 3,
        status: 'active',
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      },
      {
        id: '104',
        category_id: '1',
        name: 'Təhsil alan əlilliyi olan şagirdlərin sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Əlilliyi olan şagirdlərin sayını daxil edin',
        help_text: 'Əlilliyi olan və xüsusi qayğıya ehtiyacı olan şagirdlərin sayı',
        order_index: 4,
        status: 'active',
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      }
    ]
  },
  {
    id: '2',
    name: 'Müəllim məlumatları',
    description: 'Məktəbdə çalışan müəllimlərin statistik məlumatları',
    assignment: 'all',
    deadline: '2023-05-30',
    status: 'active',
    priority: 2,
    created_at: '2023-01-15',
    updated_at: '2023-01-15',
    columns: [
      {
        id: '201',
        category_id: '2',
        name: 'Müəllimlərin ümumi sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Müəllimlərin ümumi sayını daxil edin',
        help_text: 'Cari təhsil ilində işləyən müəllimlərin ümumi sayı',
        order_index: 1,
        status: 'active',
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      },
      {
        id: '202',
        category_id: '2',
        name: 'Qadın müəllimlərin sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Qadın müəllimlərin sayını daxil edin',
        help_text: 'Cari təhsil ilində işləyən qadın müəllimlərin sayı',
        order_index: 2,
        status: 'active',
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      },
      {
        id: '203',
        category_id: '2',
        name: 'Kişi müəllimlərin sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Kişi müəllimlərin sayını daxil edin',
        help_text: 'Cari təhsil ilində işləyən kişi müəllimlərin sayı',
        order_index: 3,
        status: 'active',
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      },
      {
        id: '204',
        category_id: '2',
        name: 'Ali təhsilli müəllimlərin sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Ali təhsilli müəllimlərin sayını daxil edin',
        help_text: 'Ali təhsil diplomuna sahib olan müəllimlərin sayı',
        order_index: 4,
        status: 'active',
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      },
      {
        id: '205',
        category_id: '2',
        name: '5 ildən az təcrübəsi olan müəllimlərin sayı',
        type: 'number',
        is_required: false,
        placeholder: '5 ildən az təcrübəsi olan müəllimlərin sayını daxil edin',
        help_text: 'Pedaqoji təcrübəsi 5 ildən az olan müəllimlərin sayı',
        order_index: 5,
        status: 'active',
        created_at: '2023-01-15',
        updated_at: '2023-01-15'
      }
    ]
  },
  {
    id: '3',
    name: 'İnfrastruktur məlumatları',
    description: 'Məktəb binası və infrastruktur haqqında məlumatlar',
    assignment: 'all',
    deadline: '2023-06-15',
    status: 'active',
    priority: 3,
    created_at: '2023-01-20',
    updated_at: '2023-01-20',
    columns: [
      {
        id: '301',
        category_id: '3',
        name: 'Sinif otaqlarının sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Sinif otaqlarının sayını daxil edin',
        help_text: 'Məktəbdəki ümumi sinif otaqlarının sayı',
        order_index: 1,
        status: 'active',
        created_at: '2023-01-20',
        updated_at: '2023-01-20'
      },
      {
        id: '302',
        category_id: '3',
        name: 'Laboratoriyaların sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Laboratoriyaların sayını daxil edin',
        help_text: 'Məktəbdəki ümumi laboratoriyaların sayı',
        order_index: 2,
        status: 'active',
        created_at: '2023-01-20',
        updated_at: '2023-01-20'
      },
      {
        id: '303',
        category_id: '3',
        name: 'İdman zalı mövcuddurmu?',
        type: 'checkbox',
        is_required: true,
        help_text: 'Məktəbdə idman zalının olub-olmadığını qeyd edin',
        order_index: 3,
        status: 'active',
        created_at: '2023-01-20',
        updated_at: '2023-01-20'
      },
      {
        id: '304',
        category_id: '3',
        name: 'Elektron lövhələrin sayı',
        type: 'number',
        is_required: true,
        placeholder: 'Elektron lövhələrin sayını daxil edin',
        help_text: 'Məktəbdəki ümumi elektron lövhələrin sayı',
        order_index: 4,
        status: 'active',
        created_at: '2023-01-20',
        updated_at: '2023-01-20'
      }
    ]
  }
];
