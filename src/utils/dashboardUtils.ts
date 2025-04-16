
// Dashboard-la əlaqəli utilit funksiyalar

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'approved':
      return 'bg-green-500';
    case 'pending':
    case 'in progress':
      return 'bg-yellow-500';
    case 'inactive':
    case 'rejected':
    case 'failed':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Utilit funksiyaları burada əlavə edə bilərsiniz

export default {
  formatNumber,
  calculatePercentage,
  calculateGrowth,
  truncateText,
  getStatusColor
};
