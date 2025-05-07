
import { useMemo } from 'react';
import { CategoryWithColumns } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

// Kateqoriya statuslarını idarə edən hook
export const useCategoryStatus = (category: CategoryWithColumns) => {
  const { t } = useLanguage();
  
  // Tamamlanma nisbətini hesabla
  const completionPercentage = useMemo(() => {
    return category.completionRate || 0;
  }, [category.completionRate]);
  
  // Status rəngini müəyyən et
  const statusColor = useMemo(() => {
    switch (category.status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, [category.status]);
  
  // Tamamlanma rəngini müəyyən et
  const completionColor = useMemo(() => {
    if (completionPercentage >= 75) {
      return 'bg-green-500';
    } else if (completionPercentage >= 50) {
      return 'bg-amber-500';
    } else if (completionPercentage >= 25) {
      return 'bg-orange-500';
    } else {
      return 'bg-red-500';
    }
  }, [completionPercentage]);
  
  // Tərcümə edilmiş status adı
  const statusName = useMemo(() => {
    switch (category.status) {
      case 'active':
        return t('active');
      case 'inactive':
        return t('inactive');
      case 'archived':
        return t('archived');
      case 'draft':
        return t('draft');
      default:
        return t('unknown');
    }
  }, [category.status, t]);
  
  return {
    completionPercentage,
    statusColor,
    completionColor,
    statusName
  };
};
