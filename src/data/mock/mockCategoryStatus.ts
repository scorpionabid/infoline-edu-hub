
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
