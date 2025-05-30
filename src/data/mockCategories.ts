import { Column, ColumnOption } from '@/types/column';
import { ColumnType } from '@/types/column.d';

// Make sure ColumnOption has id fields
const statusOptions: ColumnOption[] = [
  { id: "1", label: "Active", value: "active" },
  { id: "2", label: "Inactive", value: "inactive" }
];

export const mockCategories = [
  {
    id: '1',
    name: 'Ümumi məlumatlar',
    description: 'Məktəbin ümumi məlumatları',
    status: 'active',
    columns: [
      {
        id: '1',
        name: 'Məktəbin adı',
        type: 'text' as ColumnType,
        category_id: '1',
        is_required: true,
        order_index: 1,
        help_text: 'Məktəbin tam adını daxil edin',
        placeholder: 'Məktəbin adı',
        status: 'active',
        options: [],
      },
      {
        id: '2',
        name: 'Məktəbin tipi',
        type: 'select' as ColumnType,
        category_id: '1',
        is_required: true,
        order_index: 2,
        help_text: 'Məktəbin tipini seçin',
        placeholder: 'Məktəbin tipi',
        status: 'active',
        options: [
          { id: 'opt1', label: 'Vahid məktəb', value: 'single_school' },
          { id: 'opt2', label: 'Kompleks məktəb', value: 'complex_school' }
        ],
      },
      {
        id: '3',
        name: 'Yaranma tarixi',
        type: 'date' as ColumnType,
        category_id: '1',
        is_required: false,
        order_index: 3,
        help_text: 'Məktəbin yaranma tarixini daxil edin',
        placeholder: 'Tarix seçin',
        status: 'active',
        options: [],
      },
    ],
  },
  {
    id: '2',
    name: 'Müəllim heyəti',
    description: 'Müəllim heyəti ilə bağlı məlumatlar',
    status: 'active',
    columns: [
      {
        id: '4',
        name: 'Müəllimlərin sayı',
        type: 'number' as ColumnType,
        category_id: '2',
        is_required: true,
        order_index: 1,
        help_text: 'Məktəbdəki müəllimlərin ümumi sayı',
        placeholder: 'Müəllim sayı',
        status: 'active',
        options: [],
      },
      {
        id: '5',
        name: 'Attestasiyadan keçən müəllimlər',
        type: 'number' as ColumnType,
        category_id: '2',
        is_required: false,
        order_index: 2,
        help_text: 'Attestasiyadan keçən müəllimlərin sayı',
        placeholder: 'Attestasiya sayı',
        status: 'active',
        options: [],
      },
    ],
  },
  {
    id: '3',
    name: 'Şagird kontingenti',
    description: 'Şagirdlərin sayı və digər məlumatlar',
    status: 'active',
    columns: [
      {
        id: '6',
        name: 'Ümumi şagird sayı',
        type: 'number' as ColumnType,
        category_id: '3',
        is_required: true,
        order_index: 1,
        help_text: 'Məktəbdə təhsil alan şagirdlərin ümumi sayı',
        placeholder: 'Şagird sayı',
        status: 'active',
        options: [],
      },
      {
        id: '7',
        name: 'Buraxılış şagirdlərin sayı',
        type: 'number' as ColumnType,
        category_id: '3',
        is_required: false,
        order_index: 2,
        help_text: 'Bu il məktəbi bitirən şagirdlərin sayı',
        placeholder: 'Buraxılış sayı',
        status: 'active',
        options: [],
      },
    ],
  },
  {
    id: '4',
    name: 'Tədris dili',
    description: 'Tədrisin aparıldığı dil',
    status: 'active',
    columns: [
      {
        id: '8',
        name: 'Tədris dili',
        type: 'select' as ColumnType,
        category_id: '4',
        is_required: true,
        order_index: 1,
        help_text: 'Tədrisin aparıldığı dili seçin',
        placeholder: 'Dil seçin',
        status: 'active',
        options: [
          { id: 'opt3', label: 'Azərbaycan', value: 'az' },
          { id: 'opt4', label: 'Rus', value: 'ru' },
          { id: 'opt5', label: 'İngilis', value: 'en' },
        ],
      },
    ],
  },
];
