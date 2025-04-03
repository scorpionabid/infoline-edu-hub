
/**
 * Tarixi lokal formata çevirir
 * @param date Formatlaşdırılacaq tarix (string və ya Date ola bilər)
 * @param locale İstifadə ediləcək lokal format, default 'az-AZ'
 * @returns Formatlaşdırılmış tarix string'i
 */
export const formatDateToLocale = (
  date: string | Date | null | undefined,
  locale: string = 'az-AZ'
): string => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Əgər düzgün tarix deyilsə
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Tarix və saatı lokal formata çevirir
 * @param date Formatlaşdırılacaq tarix (string və ya Date ola bilər)
 * @param locale İstifadə ediləcək lokal format, default 'az-AZ'
 * @returns Formatlaşdırılmış tarix və saat string'i
 */
export const formatDateTimeToLocale = (
  date: string | Date | null | undefined,
  locale: string = 'az-AZ'
): string => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Əgər düzgün tarix deyilsə
  if (isNaN(dateObj.getTime())) return '-';
  
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * İki tarix arasındakı fərqi günlə qaytarır
 * @param startDate Başlanğıc tarix
 * @param endDate Son tarix, verilməsə cari tarix istifadə olunur
 * @returns Günlər arasındakı fərq (tam ədəd)
 */
export const getDaysBetweenDates = (
  startDate: string | Date,
  endDate: string | Date = new Date()
): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  // Milisaniyə fərqini günə çevir
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
