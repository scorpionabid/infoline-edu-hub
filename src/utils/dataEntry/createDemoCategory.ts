
import { v4 as uuidv4 } from 'uuid';
import { CategoryWithColumns, Column, ColumnType } from '@/types/column';

// Sütun yaradıcı yardımçı funksiya
export const createDemoColumn = (
  categoryId: string, 
  name: string, 
  type: ColumnType, 
  isRequired: boolean, 
  orderIndex: number, 
  helpText: string,
  validation: any = {}
): Column => {
  return {
    id: uuidv4(),
    category_id: categoryId,
    name,
    type,
    is_required: isRequired,
    order_index: orderIndex,
    status: 'active',
    help_text: helpText,
    validation,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: []
  };
};

// Checkbox sütunu yaradıcı
export const createDemoCheckboxColumn = (
  categoryId: string, 
  name: string, 
  isRequired: boolean, 
  orderIndex: number, 
  helpText: string
): Column => {
  return {
    id: uuidv4(),
    category_id: categoryId,
    name,
    type: 'checkbox',
    is_required: isRequired,
    order_index: orderIndex,
    status: 'active',
    help_text: helpText,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    validation: {},
    options: []
  };
};

// Select sütunu yaradıcı
export const createDemoSelectColumn = (
  categoryId: string, 
  name: string, 
  isRequired: boolean, 
  orderIndex: number, 
  helpText: string,
  options: { label: string, value: string }[]
): Column => {
  return {
    id: uuidv4(),
    category_id: categoryId,
    name,
    type: 'select',
    is_required: isRequired,
    order_index: orderIndex,
    status: 'active',
    help_text: helpText,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    validation: {},
    options
  };
};

// Demo kateqoriya yaradıcı
export const createDemoCategory = (): CategoryWithColumns => {
  const categoryId = uuidv4();
  
  const columns: Column[] = [
    createDemoColumn(
      categoryId,
      'Şagird sayı',
      'number',
      true,
      1,
      'Məktəbdəki ümumi şagird sayını daxil edin',
      { minValue: 0, maxValue: 10000 }
    ),
    createDemoColumn(
      categoryId,
      'Müəllim sayı',
      'number',
      true,
      2,
      'Məktəbdəki ümumi müəllim sayını daxil edin',
      { minValue: 0, maxValue: 1000 }
    ),
    createDemoCheckboxColumn(
      categoryId,
      'İngilis dili tədris olunur',
      false,
      3,
      'Məktəbdə ingilis dili tədris olunursa seçin'
    ),
    createDemoSelectColumn(
      categoryId,
      'Tədris dili',
      true,
      4,
      'Məktəbdə əsas tədris dilini seçin',
      [
        { label: 'Azərbaycan dili', value: 'az' },
        { label: 'Rus dili', value: 'ru' },
        { label: 'İngilis dili', value: 'en' }
      ]
    )
  ];
  
  return {
    id: categoryId,
    name: 'Ümumi Məktəb Məlumatları',
    description: 'Məktəb haqqında əsas statistik məlumatlar',
    assignment: 'all',
    deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    status: 'active',
    priority: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived: false,
    column_count: columns.length,
    columns
  };
};
