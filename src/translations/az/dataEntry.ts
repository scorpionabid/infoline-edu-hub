
// Data Entry translation module
export const dataEntry = {
  // Basic terms
  data_entry: 'Məlumat daxil etmə',
  form: 'Form',
  forms: 'Formlar',
  entry: 'Giriş',
  
  // Form operations
  save_entry: 'Girişi saxla',
  submit_entry: 'Girişi təqdim et',
  draft_entry: 'Qaralama saxla',
  clear_form: 'Formu təmizlə',
  
  // Form status
  pending: 'Gözləyir',
  approved: 'Təsdiqləndi',
  rejected: 'Rədd edildi',
  draft: 'Qaralama',
  
  // Validation
  required_field: 'Bu sahə mütləqdir',
  invalid_data: 'Səhv məlumat',
  
  // Messages
  entry_saved: 'Giriş saxlandı',
  entry_submitted: 'Giriş təqdim edildi',
  entry_failed: 'Giriş uğursuz oldu'
} as const;

export type DataEntry = typeof dataEntry;
export default dataEntry;
