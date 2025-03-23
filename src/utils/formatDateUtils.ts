
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

/**
 * Nisbi tarix formatını qaytarır (bugün, dünən, 3 gün əvvəl və s.)
 * @param dateString - ISO formatında tarix
 * @returns Nisbi tarix formatı
 */
export const formatRelativeDate = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Bugün';
    } else if (diffDays === 1) {
      return 'Dünən';
    } else if (diffDays < 7) {
      return `${diffDays} gün əvvəl`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} həftə əvvəl`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ay əvvəl`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} il əvvəl`;
    }
  } catch (error) {
    console.error('Nisbi tarix formatı xətası:', error);
    return '';
  }
};
