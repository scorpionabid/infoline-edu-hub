import { ColumnOption } from '@/types/column';

/**
 * Utility functions for parsing and normalizing column options
 * Bu utility təkrarçılığı aradan qaldırır və options parsing-i standardlaşdırır
 */

export const parseColumnOptions = (options: any): ColumnOption[] => {
  console.log('🔧 parseColumnOptions input:', { options, type: typeof options });

  // Null və ya undefined
  if (!options) {
    console.log('📝 parseColumnOptions: options is null/undefined');
    return [];
  }

  // Artıq array-dirsə
  if (Array.isArray(options)) {
    console.log('📝 parseColumnOptions: options is already array');
    return normalizeOptionArray(options);
  }

  // String-dirsə (JSON)
  if (typeof options === 'string') {
    try {
      console.log('📝 parseColumnOptions: parsing JSON string');
      const parsed = JSON.parse(options);
      return parseColumnOptions(parsed); // Recursive call
    } catch (error) {
      console.error('❌ parseColumnOptions: JSON parse error:', error);
      console.log('📝 Raw string was:', options);
      return [];
    }
  }

  // Object-dirsə (single option)
  if (typeof options === 'object') {
    console.log('📝 parseColumnOptions: single object option');
    return normalizeOptionArray([options]);
  }

  console.warn('⚠️ parseColumnOptions: unexpected type:', typeof options);
  return [];
};

export const normalizeOptionArray = (options: any[]): ColumnOption[] => {
  console.log('🔧 normalizeOptionArray input:', options);

  return options
    .filter(option => option != null) // null və undefined-i filtirlə
    .map((option, index) => {
      // Artıq düzgün format-dadırsa
      if (
        typeof option === 'object' &&
        'value' in option &&
        'label' in option
      ) {
        return {
          id: option.id || option.value,
          value: option.value,
          label: option.label,
          disabled: option.disabled || false,
          description: option.description
        } as ColumnOption;
      }

      // String-dirsə
      if (typeof option === 'string') {
        return {
          id: option,
          value: option,
          label: option,
          disabled: false
        } as ColumnOption;
      }

      // Object amma başqa struktura sahib
      if (typeof option === 'object') {
        const value = option.value || option.id || option.key || String(option);
        const label = option.label || option.name || option.title || value;
        
        return {
          id: option.id || value,
          value: value,
          label: label,
          disabled: option.disabled || false,
          description: option.description || option.help
        } as ColumnOption;
      }

      // Fallback
      console.warn(`⚠️ normalizeOptionArray: unexpected option at index ${index}:`, option);
      return {
        id: String(index),
        value: String(option),
        label: String(option),
        disabled: false
      } as ColumnOption;
    });
};

/**
 * Debug utility - options-ları validasiya edir
 */
export const validateColumnOptions = (options: ColumnOption[], columnName: string): boolean => {
  if (!Array.isArray(options)) {
    console.error(`❌ ${columnName}: options is not an array`);
    return false;
  }

  if (options.length === 0) {
    console.warn(`⚠️ ${columnName}: no options available`);
    return false;
  }

  const invalidOptions = options.filter(option => 
    !option || 
    typeof option !== 'object' || 
    !option.value || 
    !option.label
  );

  if (invalidOptions.length > 0) {
    console.error(`❌ ${columnName}: invalid options found:`, invalidOptions);
    return false;
  }

  console.log(`✅ ${columnName}: ${options.length} valid options`);
  return true;
};

/**
 * Supabase-dən gələn raw column data-nı transform edir
 */
export const transformRawColumnData = (rawColumn: any) => {
  const baseColumn = {
    ...rawColumn,
    options: parseColumnOptions(rawColumn.options),
    validation: rawColumn.validation ? 
      (typeof rawColumn.validation === 'string' ? JSON.parse(rawColumn.validation) : rawColumn.validation) : 
      {},
    help_text: rawColumn.help_text || '',
    placeholder: rawColumn.placeholder || '',
    is_required: rawColumn.is_required || false,
    default_value: rawColumn.default_value || ''
  };

  // Debug log for select columns
  if (rawColumn.type === 'select') {
    console.group(`🔄 Transforming select column: ${rawColumn.name}`);
    console.log('Raw options:', rawColumn.options);
    console.log('Parsed options:', baseColumn.options);
    console.log('Options valid:', validateColumnOptions(baseColumn.options, rawColumn.name));
    console.groupEnd();
  }

  return baseColumn;
};

export default {
  parseColumnOptions,
  normalizeOptionArray,
  validateColumnOptions,
  transformRawColumnData
};
