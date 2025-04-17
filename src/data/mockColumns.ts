
import { Column, ColumnType } from '@/types/column';

export const mockColumns: Column[] = [
  {
    id: '1',
    category_id: '1',
    name: 'Məktəb adı',
    type: 'text' as ColumnType,
    is_required: true,
    placeholder: 'Məktəbin adını daxil edin',
    help_text: 'Məktəbin tam rəsmi adını daxil edin',
    order_index: 1,
    status: 'active',
    validation: {
      minLength: 3,
      maxLength: 100
    },
    default_value: '',
    options: null,
    created_at: '2025-04-01T00:00:00.000Z',
    updated_at: '2025-04-01T00:00:00.000Z'
  },
  {
    id: '2',
    category_id: '1',
    name: 'Şagird sayı',
    type: 'number' as ColumnType,
    is_required: true,
    placeholder: 'Şagird sayını daxil edin',
    help_text: 'Məktəbdəki cəmi şagird sayını daxil edin',
    order_index: 2,
    status: 'active',
    validation: {
      minValue: 0,
      maxValue: 5000
    },
    default_value: '0',
    options: null,
    created_at: '2025-04-01T00:00:00.000Z',
    updated_at: '2025-04-01T00:00:00.000Z'
  },
  {
    id: '3',
    category_id: '1',
    name: 'Quruluş tarixi',
    type: 'date' as ColumnType,
    is_required: false,
    placeholder: 'Məktəbin quruluş tarixini seçin',
    help_text: 'Məktəbin rəsmi quruluş tarixi',
    order_index: 3,
    status: 'active',
    validation: {},
    default_value: '',
    options: null,
    created_at: '2025-04-01T00:00:00.000Z',
    updated_at: '2025-04-01T00:00:00.000Z'
  },
  {
    id: '4',
    category_id: '1',
    name: 'Məktəb növü',
    type: 'select' as ColumnType,
    is_required: true,
    placeholder: 'Məktəb növünü seçin',
    help_text: 'Məktəbin təhsil növünü seçin',
    order_index: 4,
    status: 'active',
    validation: {},
    default_value: 'Tam orta məktəb',
    options: [
      { id: '1', label: 'İbtidai məktəb', value: 'İbtidai məktəb' },
      { id: '2', label: 'Ümumi orta məktəb', value: 'Ümumi orta məktəb' },
      { id: '3', label: 'Tam orta məktəb', value: 'Tam orta məktəb' },
      { id: '4', label: 'Lisey', value: 'Lisey' },
      { id: '5', label: 'Gimnaziya', value: 'Gimnaziya' }
    ],
    created_at: '2025-04-01T00:00:00.000Z',
    updated_at: '2025-04-01T00:00:00.000Z'
  },
  {
    id: '5',
    category_id: '1',
    name: 'Qeydlər',
    type: 'textarea' as ColumnType,
    is_required: false,
    placeholder: 'Əlavə qeydləri daxil edin',
    help_text: 'Məktəb haqqında əlavə məlumatlar',
    order_index: 5,
    status: 'active',
    validation: {
      maxLength: 500
    },
    default_value: '',
    options: null,
    created_at: '2025-04-01T00:00:00.000Z',
    updated_at: '2025-04-01T00:00:00.000Z'
  },
  {
    id: '6',
    category_id: '2',
    name: 'Müəllim adı',
    type: 'text' as ColumnType,
    is_required: true,
    placeholder: 'Müəllimin adını daxil edin',
    help_text: 'Müəllimin tam adını daxil edin',
    order_index: 1,
    status: 'active',
    validation: {
      minLength: 3,
      maxLength: 100
    },
    default_value: '',
    options: null,
    created_at: '2025-04-05T00:00:00.000Z',
    updated_at: '2025-04-05T00:00:00.000Z'
  },
  {
    id: '7',
    category_id: '2',
    name: 'İxtisas',
    type: 'select' as ColumnType,
    is_required: true,
    placeholder: 'İxtisası seçin',
    help_text: 'Müəllimin ixtisasını seçin',
    order_index: 2,
    status: 'active',
    validation: {},
    default_value: '',
    options: [
      { id: '1', label: 'Riyaziyyat', value: 'Riyaziyyat' },
      { id: '2', label: 'Fizika', value: 'Fizika' },
      { id: '3', label: 'Kimya', value: 'Kimya' },
      { id: '4', label: 'Biologiya', value: 'Biologiya' },
      { id: '5', label: 'Tarix', value: 'Tarix' },
      { id: '6', label: 'Coğrafiya', value: 'Coğrafiya' },
      { id: '7', label: 'Ədəbiyyat', value: 'Ədəbiyyat' },
      { id: '8', label: 'İngilis dili', value: 'İngilis dili' },
      { id: '9', label: 'İnformatika', value: 'İnformatika' }
    ],
    created_at: '2025-04-05T00:00:00.000Z',
    updated_at: '2025-04-05T00:00:00.000Z'
  }
];
