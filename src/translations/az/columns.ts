
// Columns translation module
export const columns = {
  // Basic column terms
  column: 'Sütun',
  columns: 'Sütunlar',
  
  // Column management
  create_column: 'Sütun yarat',
  create_column_description: 'Yeni sütun yaradın',
  edit_column: 'Sütun redaktə et',
  edit_column_description: 'Sütunu redaktə edin',
  delete_column: 'Sütunu sil',
  delete_column_confirmation: 'Bu sütunu silmək istədiyinizə əminsiniz?',
  
  // Column properties
  name: 'Ad',
  type: 'Tip',
  required: 'Mütləq',
  validation: 'Doğrulama',
  options: 'Seçimlər',
  
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
