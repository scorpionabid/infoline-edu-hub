
import { Category, CategoryAssignment, CategoryStatus } from "@/types/category";
import { Column, ColumnType } from "@/types/column";
import { FormItem, FormStatus } from "@/types/form";
import { Notification, NotificationType, NotificationEntityType } from "@/types/notification";

// Mock kateqoriya adaptörü
export const adaptMockCategory = (data: any): Category => {
  return {
    id: data.id || '',
    name: data.name || '',
    description: data.description || '',
    status: (data.status as CategoryStatus) || 'active',
    assignment: (data.assignment as CategoryAssignment) || 'all',
    priority: data.priority || 0,
    archived: data.archived || false,
    column_count: data.column_count || 0,
    order: data.order || data.priority || 0,
    deadline: data.deadline || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    updatedAt: data.updatedAt || data.updated_at || new Date().toISOString()
  };
};

// Mock sütun adaptörü
export const adaptMockColumn = (data: any): Column => {
  return {
    id: data.id || '',
    name: data.name || '',
    type: (data.type as ColumnType) || 'text',
    categoryId: data.categoryId || data.category_id || '',
    isRequired: data.isRequired || data.is_required || false,
    options: data.options || [],
    orderIndex: data.orderIndex || data.order_index || 0,
    order: data.order || data.orderIndex || data.order_index || 0,
    placeholder: data.placeholder || '',
    helpText: data.helpText || data.help_text || '',
    defaultValue: data.defaultValue || data.default_value || '',
    validation: data.validation || undefined,
    status: data.status || 'active',
    parentColumnId: data.parentColumnId || data.parent_column_id || '',
    dependsOn: data.dependsOn || data.depends_on || ''
  };
};

// Form item adaptörü
export const adaptMockFormItem = (data: any): FormItem => {
  return {
    id: data.id || '',
    title: data.title || '',
    categoryId: data.categoryId || data.category_id || '',
    status: data.status as FormStatus || 'draft',
    completionPercentage: data.completionPercentage || 0,
    deadline: data.deadline || '',
    dueDate: data.dueDate || data.due_date || '',
    filledCount: data.filledCount || 0,
    totalCount: data.totalCount || 0,
    categoryName: data.categoryName || data.category_name || '',
    userId: data.userId || data.user_id || '',
    schoolId: data.schoolId || data.school_id || ''
  };
};

// Mock bildiriş adaptörü
export const adaptMockNotification = (data: any): Notification => {
  return {
    id: data.id || '',
    title: data.title || '',
    message: data.message || '',
    type: data.type as NotificationType || 'info',
    priority: data.priority || 'normal',
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    isRead: data.isRead || data.is_read || false,
    userId: data.userId || data.user_id || '',
    relatedEntityId: data.relatedEntityId || data.related_entity_id || '',
    relatedEntityType: data.relatedEntityType as NotificationEntityType || data.related_entity_type || 'system',
    time: data.time || data.createdAt || data.created_at || ''
  };
};
