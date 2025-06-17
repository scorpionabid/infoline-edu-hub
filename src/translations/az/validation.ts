
// Validation translation module
export const validation = {
  // Required fields
  required: 'Bu sahə mütləqdir',
  email_required: 'E-poçt mütləqdir',
  password_required: 'Şifrə mütləqdir',
  
  // Format validation
  invalid_email: 'E-poçt formatı düzgün deyil',
  invalid_phone: 'Telefon nömrəsi düzgün deyil',
  invalid_format: 'Format düzgün deyil',
  
  // Length validation
  min_length: 'Ən azı {{min}} simvol olmalıdır',
  max_length: 'Ən çoxu {{max}} simvol ola bilər',
  
  // Number validation
  min_value: 'Ən kiçik dəyər {{min}} olmalıdır',
  max_value: 'Ən böyük dəyər {{max}} ola bilər',
  
  // Password validation
  password_too_short: 'Şifrə çox qısadır',
  password_too_weak: 'Şifrə çox zəifdir',
  passwords_dont_match: 'Şifrələr uyğun gəlmir'
} as const;

export type Validation = typeof validation;
export default validation;
