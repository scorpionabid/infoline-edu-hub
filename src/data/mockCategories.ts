// Kategoriyalar haqqında test məlumatlar

// Kategoriyaların siyahısı
export const mockCategories = [
  {
    id: 'cat-1',
    name: 'Ümumi məlumat',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-15',
    updatedAt: '2023-02-10',
    priority: 1,
    completionRate: 78,
    deadline: '2023-12-25'
  },
  {
    id: 'cat-2',
    name: 'Müəllim heyəti',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-16',
    updatedAt: '2023-03-05',
    priority: 2,
    completionRate: 65,
    deadline: '2023-12-20'
  },
  {
    id: 'cat-3',
    name: 'Şagirdlər',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-17',
    updatedAt: '2023-02-20',
    priority: 3,
    completionRate: 82,
    deadline: '2023-12-15'
  },
  {
    id: 'cat-4',
    name: 'Texniki baza',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-18',
    updatedAt: '2023-04-15',
    priority: 4,
    completionRate: 59,
    deadline: '2023-12-30'
  },
  {
    id: 'cat-5',
    name: 'Maliyyə',
    assignment: 'Sectors',
    status: 'active',
    createdAt: '2023-01-19',
    updatedAt: '2023-03-25',
    priority: 5,
    completionRate: 45,
    deadline: '2024-01-10'
  },
  {
    id: 'cat-6',
    name: 'Tədris planı',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-20',
    updatedAt: '2023-04-10',
    priority: 6,
    completionRate: 91,
    deadline: '2024-01-15'
  },
  {
    id: 'cat-7',
    name: 'İnfrastruktur',
    assignment: 'All',
    status: 'inactive',
    createdAt: '2023-01-21',
    updatedAt: '2023-04-05',
    priority: 7,
    completionRate: 38,
    deadline: '2023-12-10'
  },
  {
    id: 'cat-8',
    name: 'İmtahan nəticələri',
    assignment: 'All',
    status: 'active',
    createdAt: '2023-01-22',
    updatedAt: '2023-05-01',
    priority: 8,
    completionRate: 73,
    deadline: '2024-01-20'
  }
];

// Hər bir kategoriya üçün sütunlar
export const mockColumns = {
  'cat-1': [
    {
      id: 'col-1',
      categoryId: 'cat-1',
      name: 'Məktəb adı',
      type: 'text',
      required: true,
      defaultValue: '',
      placeholder: 'Məktəbin tam adını daxil edin',
      helpText: 'Rəsmi sənədlərdə göstərilən adı yazın',
      orderIndex: 1
    },
    {
      id: 'col-2',
      categoryId: 'cat-1',
      name: 'Direktor',
      type: 'text',
      required: true,
      defaultValue: '',
      placeholder: 'Direktorun ad və soyadı',
      helpText: '',
      orderIndex: 2
    },
    {
      id: 'col-3',
      categoryId: 'cat-1',
      name: 'Təsis tarixi',
      type: 'date',
      required: false,
      defaultValue: '',
      placeholder: '',
      helpText: 'Məktəbin təsis olunduğu tarix',
      orderIndex: 3
    },
    {
      id: 'col-4',
      categoryId: 'cat-1',
      name: 'Məktəb növü',
      type: 'select',
      required: true,
      defaultValue: '',
      placeholder: 'Məktəb növünü seçin',
      helpText: '',
      options: ['Tam orta məktəb', 'Ümumi orta məktəb', 'İbtidai məktəb', 'Lisey', 'Gimnaziya'],
      orderIndex: 4
    },
    {
      id: 'col-5',
      categoryId: 'cat-1',
      name: 'Ünvan',
      type: 'textarea',
      required: true,
      defaultValue: '',
      placeholder: 'Məktəbin tam ünvanını daxil edin',
      helpText: '',
      orderIndex: 5
    }
  ],
  'cat-2': [
    {
      id: 'col-6',
      categoryId: 'cat-2',
      name: 'Müəllimlərin ümumi sayı',
      type: 'number',
      required: true,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      orderIndex: 1
    },
    {
      id: 'col-7',
      categoryId: 'cat-2',
      name: 'Qadın müəllimlərin sayı',
      type: 'number',
      required: true,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      orderIndex: 2
    },
    {
      id: 'col-8',
      categoryId: 'cat-2',
      name: 'Kişi müəllimlərin sayı',
      type: 'number',
      required: true,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      orderIndex: 3
    },
    {
      id: 'col-9',
      categoryId: 'cat-2',
      name: 'Ali təhsilli müəllimlərin sayı',
      type: 'number',
      required: true,
      defaultValue: '',
      placeholder: '',
      helpText: '',
      orderIndex: 4
    },
    {
      id: 'col-10',
      categoryId: 'cat-2',
      name: 'Orta ixtisas təhsilli müəllimlərin sayı',
      type: 'number',
      required: false,
      defaultValue: '0',
      placeholder: '',
      helpText: '',
      orderIndex: 5
    }
  ],
};

// Məktəblər üçün test dataları
export const mockSchoolData = {
  'school-1': {
    'cat-1': {
      'col-1': 'Bakı şəhəri 32 nömrəli tam orta məktəb',
      'col-2': 'Əliyev Vüqar Səməd oğlu',
      'col-3': '1975-09-01',
      'col-4': 'Tam orta məktəb',
      'col-5': 'Bakı şəhəri, Nəsimi rayonu, Cavid pr. 15'
    },
    'cat-2': {
      'col-6': 65,
      'col-7': 48,
      'col-8': 17,
      'col-9': 62,
      'col-10': 3
    }
  },
  'school-2': {
    'cat-1': {
      'col-1': 'Bakı şəhəri 158 nömrəli tam orta məktəb',
      'col-2': 'Hüseynova Sevinc Kamil qızı',
      'col-3': '1980-09-01',
      'col-4': 'Tam orta məktəb',
      'col-5': 'Bakı şəhəri, Nərimanov rayonu, Əliyar Əliyev küç. 25'
    },
    'cat-2': {
      'col-6': 78,
      'col-7': 56,
      'col-8': 22,
      'col-9': 75,
      'col-10': 3
    }
  }
};

// Kategoriya statusu üçün test məlumatlar
export const categoryStatus = [
  {
    categoryId: 'cat-1',
    schoolId: 'school-1',
    status: 'completed',
    completionPercentage: 100,
    approvedBy: 'admin-1',
    approvedAt: '2023-09-15',
    updatedAt: '2023-09-10'
  },
  {
    categoryId: 'cat-2',
    schoolId: 'school-1',
    status: 'pending',
    completionPercentage: 80,
    approvedBy: null,
    approvedAt: null,
    updatedAt: '2023-09-12'
  },
  {
    categoryId: 'cat-3',
    schoolId: 'school-1',
    status: 'not-started',
    completionPercentage: 0,
    approvedBy: null,
    approvedAt: null,
    updatedAt: null
  },
  {
    categoryId: 'cat-1',
    schoolId: 'school-2',
    status: 'rejected',
    completionPercentage: 100,
    approvedBy: 'admin-2',
    approvedAt: null,
    updatedAt: '2023-09-11',
    rejectedReason: 'Məlumatlar tam deyil'
  }
];

// Export all mock data
export const mockCategoryData = {
  categories: mockCategories,
  columns: mockColumns,
  schoolData: mockSchoolData,
  categoryStatus: categoryStatus
};

export default mockCategoryData;
