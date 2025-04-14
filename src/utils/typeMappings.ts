
import { Column } from "@/types/column"; 

/**
 * Tip yoxlama və konversiya funksiyaları
 */

/**
 * Sütun tipinin düzgün olub-olmadığını yoxlayır
 * @param type Yoxlanılacaq tip
 */
export function isValidColumnType(type: string): type is Column['type'] {
  return ['text', 'number', 'date', 'select', 'textarea', 'checkbox'].includes(type);
}

/**
 * Supabase sütun tipini tətbiq Column tipinə çevirir
 * @param dbType Verilənlər bazası tip dəyəri
 */
export function mapDbColumnTypeToAppType(dbType: string): Column['type'] {
  switch (dbType) {
    case 'text':
    case 'string':
      return 'text';
    case 'number':
    case 'integer':
    case 'float':
      return 'number';
    case 'date':
    case 'datetime':
    case 'timestamp':
      return 'date';
    case 'select':
    case 'dropdown':
    case 'enum':
      return 'select';
    case 'textarea':
    case 'longtext':
      return 'textarea';
    case 'checkbox':
    case 'boolean':
      return 'checkbox';
    default:
      return 'text'; // Default olaraq text qəbul edirik
  }
}

/**
 * Verilənlər bazasından gələn sütunu tətbiq Sütun tipinə çevirir
 * @param dbColumn Verilənlər bazasından gələn sütun
 */
export function mapDbColumnToAppColumn(dbColumn: any): Column {
  return {
    id: dbColumn.id,
    name: dbColumn.name,
    type: mapDbColumnTypeToAppType(dbColumn.type),
    category_id: dbColumn.category_id,
    is_required: dbColumn.is_required || false,
    order_index: dbColumn.order_index || 0,
    help_text: dbColumn.help_text,
    placeholder: dbColumn.placeholder,
    options: dbColumn.options ? JSON.parse(typeof dbColumn.options === 'string' ? dbColumn.options : JSON.stringify(dbColumn.options)) : [],
    validation: dbColumn.validation ? JSON.parse(typeof dbColumn.validation === 'string' ? dbColumn.validation : JSON.stringify(dbColumn.validation)) : {},
    default_value: dbColumn.default_value,
    status: dbColumn.status || 'active'
  };
}
