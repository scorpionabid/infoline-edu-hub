
import { 
  Notification,
  adaptNotification, 
  NotificationType 
} from '@/types/notification';

import {
  FormItem,
  FormStatus
} from '@/types/form';

import {
  ActivityItem
} from '@/types/dashboard';

import {
  Category,
  CategoryAssignment,
  CategoryStatus
} from '@/types/category';

import {
  Column,
  ColumnType
} from '@/types/column';

// Bildirişləri adaptasiya etmək üçün
export const adaptNotifications = (notifications: any[]): Notification[] => {
  if (!notifications || !Array.isArray(notifications)) {
    console.warn('Bildirişlər bir array deyil:', notifications);
    return [];
  }
  
  return notifications.map(notification => adaptNotification(notification));
};

// Form elementlərini adaptasiya etmək üçün
export const adaptFormItems = (formItems: any[]): FormItem[] => {
  if (!formItems || !Array.isArray(formItems)) {
    console.warn('Form elementləri bir array deyil:', formItems);
    return [];
  }
  
  return formItems.map(item => ({
    id: item.id || '',
    title: item.title || '',
    categoryId: item.categoryId || item.category_id || '',
    status: (item.status as FormStatus) || 'draft',
    completionPercentage: item.completionPercentage || item.completion_percentage || 0,
    deadline: item.deadline || '',
    filledCount: item.filledCount || item.filled_count || 0,
    totalCount: item.totalCount || item.total_count || 0,
    dueDate: item.dueDate || item.due_date || item.deadline || '',
    categoryName: item.categoryName || item.category_name || '',
    data: item.data || {},
    userId: item.userId || item.user_id || '',
    schoolId: item.schoolId || item.school_id || ''
  }));
};

// Aktivlik elementlərini adaptasiya etmək üçün
export const adaptActivityItems = (activityItems: any[]): ActivityItem[] => {
  if (!activityItems || !Array.isArray(activityItems)) {
    console.warn('Aktivlik elementləri bir array deyil:', activityItems);
    return [];
  }
  
  return activityItems.map(item => ({
    id: item.id || '',
    type: item.type || '',
    title: item.title || '',
    description: item.description || '',
    timestamp: item.timestamp || item.created_at || new Date().toISOString(),
    userId: item.userId || item.user_id || '',
    action: item.action || '',
    actor: item.actor || '',
    target: item.target || '',
    time: item.time || item.timestamp || ''
  }));
};

// Kateqoriya tamamlanma məlumatlarını simulyasiya etmək üçün
export const getMockCategoryCompletion = () => {
  return [
    { name: 'Təcili məlumatlar', completed: 85 },
    { name: 'Tədris', completed: 65 },
    { name: 'İnfrastruktur', completed: 72 },
    { name: 'Davamiyyət', completed: 90 },
    { name: 'Nailiyyət', completed: 45 }
  ];
};

// Kateqoriya məlumatlarını adaptasiya etmək üçün
export const adaptCategory = (category: any): Category => {
  return {
    id: category.id || '',
    name: category.name || '',
    description: category.description || '',
    status: (category.status as CategoryStatus) || 'active',
    assignment: (category.assignment as CategoryAssignment) || 'all',
    priority: category.priority || 0,
    archived: category.archived || false,
    column_count: category.column_count || 0,
    order: category.order || category.priority || 0,
    deadline: category.deadline || null,
    created_at: category.created_at || '',
    updated_at: category.updated_at || '',
    createdAt: category.createdAt || category.created_at || '',
    updatedAt: category.updatedAt || category.updated_at || ''
  };
};

// Sütun məlumatlarını adaptasiya etmək üçün
export const adaptColumn = (column: any): Column => {
  let options: string[] | { label: string; value: string }[] = [];
  
  if (column.options) {
    try {
      options = typeof column.options === 'string' ? JSON.parse(column.options) : column.options;
    } catch (e) {
      console.error('Sütun seçimlərini parse edərkən xəta baş verdi:', e);
      options = [];
    }
  }
  
  return {
    id: column.id || '',
    name: column.name || '',
    type: (column.type as ColumnType) || 'text',
    categoryId: column.categoryId || column.category_id || '',
    isRequired: column.isRequired || column.is_required || false,
    options: options,
    orderIndex: column.orderIndex || column.order_index || 0,
    order: column.order || column.orderIndex || column.order_index || 0,
    placeholder: column.placeholder || '',
    helpText: column.helpText || column.help_text || '',
    defaultValue: column.defaultValue || column.default_value || '',
    validation: column.validation ? 
      (typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation) : 
      undefined,
    status: column.status || 'active',
    parentColumnId: column.parentColumnId || column.parent_column_id || '',
    parent_column_id: column.parent_column_id || column.parentColumnId || '',
    dependsOn: column.dependsOn || column.depends_on || '',
    depends_on: column.depends_on || column.dependsOn || ''
  };
};

// Form statuslarını adaptasiya etmək üçün
export const adaptFormStatus = (status: string): FormStatus => {
  const validStatuses: FormStatus[] = ['draft', 'pending', 'approved', 'rejected', 'overdue', 'dueSoon', 'submitted'];
  
  if (validStatuses.includes(status as FormStatus)) {
    return status as FormStatus;
  }
  
  switch (status.toLowerCase()) {
    case 'due_soon':
      return 'dueSoon';
    case 'overdue':
      return 'overdue';
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'submitted':
      return 'pending';
    default:
      return 'draft';
  }
};
