
// Categories translation module
export const categories = {
  // Basic category terms
  category: 'Kateqoriya',
  categories: 'Kateqoriyalar',
  title: 'Kateqoriyalar',
  
  // Category management
  create_category: 'Kateqoriya yarat',
  create_category_description: 'Yeni kateqoriya yaradın',
  edit_category: 'Kateqoriya redaktə et',
  edit_category_description: 'Kateqoriyanı redaktə edin',
  delete_category: 'Kateqoriyanı sil',
  delete_category_confirmation: 'Bu kateqoriyanı silmək istədiyinizə əminsiniz?',
  
  // Category properties
  name: 'Ad',
  description: 'Təsvir',
  column_count: 'Sütun sayı',
  status: 'Status',
  
  // Category actions
  add_category: 'Kateqoriya əlavə et',
  save_category: 'Kateqoriyanı saxla',
  cancel: 'İmtina',
  
  // Category states
  active: 'Aktiv',
  inactive: 'Qeyri-aktiv',
  
  // Analytics
  analytics: 'Analitika',
  analytics_description: 'Kateqoriya analitikası',
  
  // Messages
  category_created: 'Kateqoriya yaradıldı',
  category_updated: 'Kateqoriya yeniləndi',
  category_deleted: 'Kateqoriya silindi',
  no_categories: 'Kateqoriya tapılmadı'
} as const;

export type Categories = typeof categories;
export default categories;
