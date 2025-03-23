
/**
 * Tarix formatını özelleştirmek üçün təhlük
 */

/**
 * ISO format tarixini özelleşdirilmiş tarix formatına çevirir
 * @param dateString - ISO formatındakı tarix (məsələn: 2023-09-05)
 * @param format - Çıxış formatı (varsayılan: DD.MM.YYYY)
 * @returns Formatlanmış tarix sətiri
 */
export const formatDate = (dateString: string, format = 'DD.MM.YYYY'): string => {
  try {
    // Əgər tarix string formatında deyilsə, boş string qaytarırıq
    if (!dateString || typeof dateString !== 'string') {
      return '';
    }

    const date = new Date(dateString);
    
    // Əgər tarix düzgün deyilsə, boş string qaytarırıq
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    if (format === 'DD.MM.YYYY') {
      return `${day}.${month}.${year}`;
    } else if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    } else if (format === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    } else if (format === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    }
    
    // Default format
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('Tarix formatı xətası:', error);
    return '';
  }
};

/**
 * Tarix və saat formatını özelleşdirir
 * @param dateString - ISO formatında tarix və saat
 * @returns Özelleşdirilmiş tarix və saat formatı
 */
export const formatDateTime = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Tarix formatı xətası:', error);
    return '';
  }
};
