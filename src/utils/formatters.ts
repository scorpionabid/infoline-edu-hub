
/**
 * Tarix formatına çevirən funksiya
 * @param dateString ISO tarix formatında string
 * @returns Formatlı tarix string-i
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return new Intl.DateTimeFormat('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Tarix formatında xəta:', error);
    return dateString;
  }
};

/**
 * Statusu formatlayan funksiya
 * @param status Status string-i
 * @returns Formatlı status string-i
 */
export const formatStatus = (status?: string): string => {
  if (!status) return '-';
  
  switch (status.toLowerCase()) {
    case 'active':
      return 'Aktiv';
    case 'inactive':
      return 'Deaktiv';
    case 'pending':
      return 'Gözləmə';
    case 'approved':
      return 'Təsdiqlənib';
    case 'rejected':
      return 'Rədd edilib';
    case 'draft':
      return 'Qaralama';
    default:
      return status;
  }
};

/**
 * Valyutanı formatlayan funksiya
 * @param amount Məbləğ
 * @param currency Valyuta kodu
 * @returns Formatlı valyuta string-i
 */
export const formatCurrency = (amount: number, currency: string = 'AZN'): string => {
  return new Intl.NumberFormat('az-AZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Əlaqə məlumatlarını formatlayan funksiya
 * @param contact Telefon nömrəsi və ya email
 * @returns Formatlı əlaqə məlumatı
 */
export const formatContact = (contact?: string): string => {
  if (!contact) return '-';
  
  // Email formatı
  if (contact.includes('@')) {
    return contact;
  }
  
  // Telefon formatı (xxx-xxx-xx-xx)
  return contact.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1-$2-$3-$4');
};

/**
 * Tam adı formatlayan funksiya
 * @param firstName Ad
 * @param lastName Soyad
 * @returns Formatlı ad soyad
 */
export const formatFullName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return '-';
  
  if (!firstName) return lastName || '-';
  if (!lastName) return firstName || '-';
  
  return `${firstName} ${lastName}`;
};

/**
 * Faizi formatlayan funksiya
 * @param percentage Faiz dəyəri
 * @returns Formatlı faiz string-i
 */
export const formatPercentage = (percentage?: number): string => {
  if (percentage === undefined || percentage === null) return '-';
  
  return `${Math.round(percentage)}%`;
};
