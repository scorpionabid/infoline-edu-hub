
import { FormItem, FormStatus } from '@/types/form';

// Mock form data for dashboard
export const mockForms: FormItem[] = [
  {
    id: 'form1',
    title: 'İllik hesabat - 2023',
    categoryId: 'cat1',
    status: 'pending',
    completionPercentage: 75,
    deadline: '2023-12-31T23:59:59Z',
    filledCount: 15,
    totalCount: 20
  },
  {
    id: 'form2',
    title: 'Şagirdlərin qeydiyyatı',
    categoryId: 'cat2',
    status: 'approved',
    completionPercentage: 100,
    deadline: '2023-11-15T23:59:59Z',
    filledCount: 25,
    totalCount: 25
  },
  {
    id: 'form3',
    title: 'Müəllimlərin attestasiyası',
    categoryId: 'cat3',
    status: 'rejected',
    completionPercentage: 60,
    deadline: '2023-10-30T23:59:59Z',
    filledCount: 12,
    totalCount: 20
  },
  {
    id: 'form4',
    title: 'İnfrastruktur hesabatı',
    categoryId: 'cat4',
    status: 'dueSoon',
    completionPercentage: 30,
    deadline: '2023-12-20T23:59:59Z',
    filledCount: 6, 
    totalCount: 20
  },
  {
    id: 'form5',
    title: 'Maliyyə hesabatı - 2023',
    categoryId: 'cat5',
    status: 'overdue',
    completionPercentage: 40,
    deadline: '2023-11-01T23:59:59Z',
    filledCount: 8,
    totalCount: 20
  }
];

// Generic status distribution for different form categories
export const mockFormStatusDistribution = {
  pending: 8,
  approved: 12,
  rejected: 3,
  dueSoon: 5,
  overdue: 2
};

// Simulated data for form completion progress over time
export const mockFormCompletionTrend = [
  { date: '2023-01-01', completion: 10 },
  { date: '2023-02-01', completion: 18 },
  { date: '2023-03-01', completion: 25 },
  { date: '2023-04-01', completion: 32 },
  { date: '2023-05-01', completion: 40 },
  { date: '2023-06-01', completion: 55 },
  { date: '2023-07-01', completion: 65 },
  { date: '2023-08-01', completion: 72 },
  { date: '2023-09-01', completion: 80 },
  { date: '2023-10-01', completion: 85 },
  { date: '2023-11-01', completion: 92 },
  { date: '2023-12-01', completion: 98 }
];
