import { FormStatus } from '@/types/dashboard';
import { mockCategories } from '@/data/mock/mockCategories';
import { MockCategory } from '@/types/category';
import { FormItem } from '@/types/dashboard';

// Deadline-ı string formatına çevirmək üçün utility funksiyası
export function transformDeadlineToString(deadline: string | Date | undefined): string {
  if (!deadline) {
    console.log('Deadline məlumatı təqdim edilməyib');
    return '';
  }
  
  try {
    return typeof deadline === 'string' ? deadline : deadline.toISOString();
  } catch (error) {
    console.error('Deadline çevirmə xətası:', error);
    return '';
  }
}

// Kateqoriyaları FormItem-lərə çevirmək üçün təhlükəsiz funksiya
export function createSafeFormItems(categoryList: MockCategory[]): FormItem[] {
  if (!Array.isArray(categoryList)) {
    console.warn('Kateqoriyalar massiv deyil', categoryList);
    return [];
  }
  
  if (categoryList.length === 0) {
    console.warn('Kateqoriyalar massivi boşdur');
    return [];
  }
  
  console.log(`${categoryList.length} kateqoriya işlənir, ilk element:`, categoryList[0]);
  
  return categoryList.map(category => {
    if (!category) {
      console.error('Kateqoriya undefined və ya null', category);
      return {
        id: `temp-${Math.random().toString(36).substr(2, 9)}`,
        title: 'Xəta: namə\'lum kateqoriya',
        category: 'Namə\'lum',
        status: 'pending' as FormStatus,
        completionPercentage: 0,
        deadline: ''
      };
    }
    
    const deadline = category.deadline ? transformDeadlineToString(category.deadline) : '';
    console.log(`Kateqoriya "${category.name}" üçün deadline: ${deadline}`);
    
    return {
      id: category.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
      title: category.name || 'Unnamed Category',
      category: category.name || 'Unnamed Category',
      status: 'pending' as FormStatus,
      completionPercentage: Math.floor(Math.random() * 100),
      deadline: deadline
    };
  });
}

// Mock məlumatlarını yoxlama funksiyası
export function validateMockCategories(): boolean {
  console.log('mockCategories tipi:', typeof mockCategories);
  console.log('mockCategories massiv?', Array.isArray(mockCategories));
  console.log('mockCategories uzunluğu:', mockCategories?.length || 'mövcud deyil');
  
  if (Array.isArray(mockCategories) && mockCategories.length > 0) {
    console.log('İlk kateqoriya nümunəsi:', mockCategories[0]);
    return true;
  } else {
    console.error('mockCategories data problemi');
    return false;
  }
}
