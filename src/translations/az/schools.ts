
// Schools translation module
export const schools = {
  // Basic terms
  school: 'Məktəb',
  schools: 'Məktəblər',
  
  // Actions
  add_school: 'Məktəb əlavə et',
  edit_school: 'Məktəbi redaktə et',
  delete_school: 'Məktəbi sil',
  
  // Properties
  name: 'Ad',
  code: 'Kod',
  type: 'Tip',
  status: 'Status',
  
  // Messages
  school_created: 'Məktəb yaradıldı',
  school_updated: 'Məktəb yeniləndi',
  school_deleted: 'Məktəb silindi'
} as const;

export type Schools = typeof schools;
export default schools;
