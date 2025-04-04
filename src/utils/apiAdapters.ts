
import { Notification, adaptNotification } from '@/types/notification';
import { FormItem, FormStatus } from '@/types/form';
import { Category, CategoryAssignment, CategoryStatus } from '@/types/category';
import { Column, ColumnOption } from '@/types/column';
import { ActivityItem } from '@/types/dashboard';
import { adaptFormStatus, formatTimeFromNow } from '@/utils/dashboardUtils';

// Notification formatını uyğunlaşdırma funksiyası
export const adaptNotifications = (notifications: any[]): Notification[] => {
  if (!notifications || !Array.isArray(notifications)) {
    console.warn('Notifications is not an array:', notifications);
    return [];
  }
  
  return notifications.map(notification => adaptNotification(notification));
};

// FormItem-ləri Form formatına çevirmək üçün helper funksiya
export const adaptFormItems = (formItems: any[]): FormItem[] => {
  if (!formItems || !Array.isArray(formItems)) {
    console.warn('FormItems is not an array:', formItems);
    return [];
  }
  
  return formItems.map(item => ({
    id: item.id || '',
    title: item.title || '',
    categoryId: item.categoryId || item.category_id || '',
    status: adaptFormStatus(item.status || 'draft'),
    completionPercentage: item.completionPercentage || item.completion_percentage || 0,
    deadline: item.deadline || item.dueDate || '',
    filledCount: item.filledCount || item.filled_count || 0,
    totalCount: item.totalCount || item.total_count || 0
  }));
};

// ActivityItem-ləri adapta etmək üçün helper funksiya
export const adaptActivityItems = (activities: any[]): ActivityItem[] => {
  if (!activities || !Array.isArray(activities)) {
    console.warn('Activities is not an array:', activities);
    return [];
  }
  
  return activities.map(item => ({
    id: item.id || '',
    type: item.type || '',
    title: item.title || '',
    description: item.description || '',
    timestamp: item.timestamp || '',
    userId: item.userId || item.user_id || '',
    action: item.action || '',
    actor: item.actor || '',
    target: item.target || '',
    time: item.time || formatTimeFromNow(item.timestamp)
  }));
};

// Kateqoriyanı Supabase formatından Category tipinə çevirmək
export const adaptCategory = (categoryData: any): Category => {
  return {
    id: categoryData.id || '',
    name: categoryData.name || '',
    description: categoryData.description || '',
    status: (categoryData.status as CategoryStatus) || 'active',
    assignment: (categoryData.assignment as CategoryAssignment) || 'all',
    priority: categoryData.priority || 0,
    archived: categoryData.archived || false,
    column_count: categoryData.column_count || 0,
    order: categoryData.order || categoryData.order_index || 0,
    deadline: categoryData.deadline || null
  };
};

// Sütunu Supabase formatından Column tipinə çevirmək
export const adaptColumn = (columnData: any): Column => {
  let options: string[] | ColumnOption[] = [];
  
  if (columnData.options) {
    try {
      if (typeof columnData.options === 'string') {
        const parsedOptions = JSON.parse(columnData.options);
        options = Array.isArray(parsedOptions) ? parsedOptions : [];
      } else if (Array.isArray(columnData.options)) {
        options = columnData.options;
      }
    } catch (e) {
      console.warn('Options parsing error:', e);
    }
  }
  
  return {
    id: columnData.id || '',
    name: columnData.name || '',
    type: columnData.type as any || 'text',
    categoryId: columnData.category_id || columnData.categoryId || '',
    isRequired: columnData.is_required || columnData.isRequired || false,
    order: columnData.order || columnData.order_index || 0,
    options: options,
    orderIndex: columnData.order_index || columnData.orderIndex || 0,
    placeholder: columnData.placeholder || '',
    helpText: columnData.help_text || columnData.helpText || '',
    defaultValue: columnData.default_value || columnData.defaultValue || '',
    validation: columnData.validation || {},
    status: columnData.status || 'active',
    parentColumnId: columnData.parent_column_id || columnData.parentColumnId || undefined,
    dependsOn: columnData.depends_on || columnData.dependsOn || undefined,
  };
};
