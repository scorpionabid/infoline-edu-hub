
import { Column } from '@/types/column';

// Hər bir kategoriya üçün sütunlar
export const mockColumns: Record<string, Column[]> = {
  'cat-1': [
    {
      id: 'col-1',
      categoryId: 'cat-1',
      name: 'Məktəb adı',
      type: 'text',
      isRequired: true,
      defaultValue: '',
      placeholder: 'Məktəbin tam adını daxil edin',
      helpText: 'Rəsmi sənədlərdə göstərilən adı yazın',
      order: 1,
      orderIndex: 0,
      status: 'active'
    },
    {
      id: 'col-2',
      categoryId: 'cat-1',
      name: 'Direktor',
      type: 'text',
      isRequired: true,
      defaultValue: '',
      placeholder: 'Direktorun ad və soyadı',
      helpText: '',
      order: 2,
      orderIndex: 1,
      status: 'active'
    },
    {
      id: 'col-3',
      categoryId: 'cat-1',
      name: 'Təsis tarixi',
      type: 'date',
      isRequired: false,
      defaultValue: '',
      placeholder: '',
      helpText: 'Məktəbin təsis olunduğu tarix',
      order: 3,
      orderIndex: 2,
      status: 'active'
    },
    {
      id: 'col-4',
      categoryId: 'cat-1',
      name: 'Məktəb növü',
      type: 'select',
      isRequired: true,
      defaultValue: '',
      placeholder: 'Məktəb növünü seçin',
      helpText: '',
      options: [
        'Tam orta məktəb',
        'Ümumi orta məktəb',
        'İbtidai məktəb',
        'Lisey',
        'Gimnaziya'
      ],
      order: 4,
      orderIndex: 3,
      status: 'active'
    },
    {
      id: 'col-5',
      categoryId: 'cat-1',
      name: 'Ünvan',
      type: 'textarea',
      isRequired: true,
      defaultValue: '',
      placeholder: 'Məktəbin tam ünvanını daxil edin',
      helpText: '',
      order: 5,
      orderIndex: 4,
      status: 'active'
    }
  ],
  'cat-2': [
    {
      id: 'col-6',
      categoryId: 'cat-2',
      name: 'Müəllimlərin ümumi sayı',
      type: 'number',
      isRequired: true,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      order: 1,
      orderIndex: 0,
      status: 'active'
    },
    {
      id: 'col-7',
      categoryId: 'cat-2',
      name: 'Qadın müəllimlərin sayı',
      type: 'number',
      isRequired: true,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      order: 2,
      orderIndex: 1,
      status: 'active'
    },
    {
      id: 'col-8',
      categoryId: 'cat-2',
      name: 'Kişi müəllimlərin sayı',
      type: 'number',
      isRequired: true,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      order: 3,
      orderIndex: 2,
      status: 'active'
    },
    {
      id: 'col-9',
      categoryId: 'cat-2',
      name: 'Ali təhsilli müəllimlərin sayı',
      type: 'number',
      isRequired: true,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      order: 4,
      orderIndex: 3,
      status: 'active'
    },
    {
      id: 'col-10',
      categoryId: 'cat-2',
      name: 'Orta ixtisas təhsilli müəllimlərin sayı',
      type: 'number',
      isRequired: false,
      defaultValue: '0',
      placeholder: '',
      helpText: '',
      order: 5,
      orderIndex: 4,
      status: 'active'
    }
  ],
};
