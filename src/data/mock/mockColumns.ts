
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
      status: 'active',
      options: []
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
      status: 'active',
      options: []
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
      status: 'active',
      options: []
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
      name: 'Əlavə qeydlər',
      type: 'textarea',
      isRequired: true,
      defaultValue: '',
      placeholder: 'Əlavə məlumatları daxil edin',
      helpText: 'Məktəb haqqında digər mühüm məlumatlar',
      order: 5,
      orderIndex: 4,
      status: 'active',
      options: []
    }
  ],
  'cat-2': [
    {
      id: 'col-6',
      categoryId: 'cat-2',
      name: 'Ümumi şagird sayı',
      type: 'number',
      isRequired: true,
      defaultValue: '',
      placeholder: 'Şagird sayını daxil edin',
      helpText: 'Bütün siniflər üzrə cəmi şagird sayı',
      order: 1,
      orderIndex: 0,
      status: 'active',
      options: []
    },
    {
      id: 'col-7',
      categoryId: 'cat-2',
      name: 'Oğlan şagird sayı',
      type: 'number',
      isRequired: true,
      defaultValue: '',
      placeholder: 'Oğlan şagirdlərin sayını daxil edin',
      helpText: '',
      order: 2,
      orderIndex: 1,
      status: 'active',
      options: []
    },
    {
      id: 'col-8',
      categoryId: 'cat-2',
      name: 'Qız şagird sayı',
      type: 'number',
      isRequired: true,
      defaultValue: '',
      placeholder: 'Qız şagirdlərin sayını daxil edin',
      helpText: '',
      order: 3,
      orderIndex: 2,
      status: 'active',
      options: []
    },
    {
      id: 'col-9',
      categoryId: 'cat-2',
      name: 'İbtidai sinif şagirdləri',
      type: 'number',
      isRequired: true,
      defaultValue: '',
      placeholder: 'İbtidai siniflərdə oxuyan şagird sayını daxil edin',
      helpText: '',
      order: 4,
      orderIndex: 3,
      status: 'active',
      options: []
    },
    {
      id: 'col-10',
      categoryId: 'cat-2',
      name: 'Xüsusi qayğıya ehtiyacı olan şagirdlər',
      type: 'number',
      isRequired: false,
      defaultValue: '',
      placeholder: 'Sayı daxil edin',
      helpText: 'Fiziki və ya əqli məhdudiyyətləri olan şagirdlərin sayı',
      order: 5,
      orderIndex: 4,
      status: 'active',
      options: []
    }
  ]
};

export default mockColumns;
