
import { FormItem, FormStatus } from '@/types/form';

export const categorizeFormsByStatus = (forms: FormItem[] = []) => {
  return {
    pending: forms.filter(form => form.status === 'pending'),
    approved: forms.filter(form => form.status === 'approved'),
    rejected: forms.filter(form => form.status === 'rejected'),
    overdue: forms.filter(form => form.status === 'overdue'),
    dueSoon: forms.filter(form => form.status === 'dueSoon'),
  };
};

export const calculateCompletionRate = (forms: FormItem[] = []) => {
  if (forms.length === 0) return 0;
  return Math.round(
    forms.reduce((sum, form) => sum + form.completionPercentage, 0) / forms.length
  );
};

export const getStatusCounts = (forms: FormItem[] = []) => {
  const categorized = categorizeFormsByStatus(forms);
  return {
    pending: categorized.pending.length,
    approved: categorized.approved.length,
    rejected: categorized.rejected.length,
    overdue: categorized.overdue.length,
    dueSoon: categorized.dueSoon.length,
  };
};

export const adaptFormStatus = (status: string): FormStatus => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'təsdiqlənib': 
      return 'approved';
    case 'rejected': 
    case 'rədd edilib':
      return 'rejected';
    case 'pending': 
    case 'gözləmədə':
      return 'pending';
    case 'overdue':
    case 'gecikmiş':
      return 'overdue';
    case 'duesoon':
    case 'dueSoon':
    case 'müddəti yaxınlaşır':
      return 'dueSoon';
    default:
      return 'pending';
  }
};

export const getMockCategoryCompletion = () => [
  { name: 'Kateqoriya 1', completed: 85 },
  { name: 'Kateqoriya 2', completed: 75 },
  { name: 'Kateqoriya 3', completed: 60 },
  { name: 'Kateqoriya 4', completed: 90 },
  { name: 'Kateqoriya 5', completed: 40 },
];
