
import { format } from 'date-fns';
import { az } from 'date-fns/locale';

/**
 * Verilmiş tarixi formatlaşdırma funksiyası
 * @param date Formatlaşdırılacaq tarix
 * @param formatPattern Format şablonu (default: 'dd.MM.yyyy')
 * @returns Formatlaşdırılmış tarix
 */
export const formatDate = (date: Date | string, formatPattern: string = 'dd.MM.yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatPattern, { locale: az });
};

/**
 * Rəqəmi formatlaşdırmaq üçün köməkçi funksiya
 * @param value Formatlaşdırılacaq rəqəm
 * @returns Formatlaşdırılmış rəqəm
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('az-AZ').format(value);
};

/**
 * Mətni qısaltmaq üçün köməkçi funksiya
 * @param text Qısaldılacaq mətn
 * @param maxLength Maksimum uzunluq
 * @returns Qısaldılmış mətn
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * İstifadəçi rolunu düzgün formata çevirmək
 * @param role Rol 
 * @returns Formatlaşdırılmış rol adı
 */
export const formatRole = (role: string): string => {
  switch (role) {
    case 'superadmin':
      return 'Super Admin';
    case 'regionadmin':
      return 'Region Admin';
    case 'sectoradmin':
      return 'Sektor Admin';
    case 'schooladmin':
      return 'Məktəb Admin';
    default:
      return role;
  }
};

/**
 * Ad və soyaddan inisiallar almaq
 * @param name Ad və/və ya soyad
 * @returns İnisiallar (iki hərf)
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
