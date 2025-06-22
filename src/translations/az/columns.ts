
// Columns translation module
export const columns = {
  // Basic column terms
  column: 'Sütun',
  columns: 'Sütunlar',
  
  // Column management
  create_column: 'Sütun yarat',
  createColumn: 'Sütun yarat',
  create_column_description: 'Yeni sütun yaradın',
  edit_column: 'Sütun redaktə et',
  editColumn: 'Sütunu redaktə et',
  edit_column_description: 'Sütunu redaktə edin',
  delete_column: 'Sütunu sil',
  delete_column_confirmation: 'Bu sütunu silmək istədiyinizə əminsiniz?',
  
  // Form fields
  columnName: 'Sütun adı',
  enterColumnName: 'Sütun adını daxil edin',
  columnType: 'Sütun tipi',
  category: 'Kateqoriya',
  selectCategory: 'Kateqoriya seçin',
  placeholder: 'Yer tutucu',
  enterPlaceholder: 'Yer tutucunu daxil edin',
  defaultValue: 'Standart dəyər',
  enterDefaultValue: 'Standart dəyəri daxil edin',
  helpText: 'Kömək mətni',
  enterHelpText: 'Kömək mətnini daxil edin',
  required: 'Məcburi',
  options: 'Seçimlər',
  optionValue: 'Seçim dəyəri',
  optionLabel: 'Seçim etiketi',
  
  // Actions
  create: 'Yarat',
  update: 'Yenilə',
  cancel: 'Ləğv et',
  creating: 'Yaradılır...',
  updating: 'Yenilənir...',
  
  // Column properties
  name: 'Ad',
  type: 'Tip',
  validation: 'Doğrulama',
  
  // Column types
  text: 'Mətn',
  number: 'Rəqəm',
  date: 'Tarix',
  boolean: 'Bəli/Xeyr',
  select: 'Seçim',
  multiselect: 'Çoxlu seçim',
  
  // Import/Export
  import_columns: 'Sütunları idxal et',
  import_description: 'Excel və ya CSV faylından sütunları idxal edin',
  export_columns: 'Sütunları ixrac et',
  
  // Messages
  column_created: 'Sütun yaradıldı',
  column_updated: 'Sütun yeniləndi',
  column_deleted: 'Sütun silindi',
  no_columns: 'Sütun tapılmadı'
} as const;

export type Columns = typeof columns;
export default columns;
