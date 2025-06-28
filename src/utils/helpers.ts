
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

/**
 * Status mətnini tərcümə və stil formatı üçün hazırlayır
 * @param status Status mətni
 * @returns Statusun key adı
 */
export const formatStatus = (status: string): string => {
  const lowercaseStatus = status.toLowerCase();
  
  switch (lowercaseStatus) {
    case 'pending':
    case 'gözləmədə':
      return 'pending';
    case 'approved':
    case 'təsdiqlənmiş':
      return 'approved';
    case 'rejected':
    case 'rədd edilmiş':
      return 'rejected';
    case 'duesoon':
    case 'tezliklə':
      return 'dueSoon';
    case 'overdue':
    case 'gecikmiş':
      return 'overdue';
    default:
      return lowercaseStatus;
  }
};

/**
 * Tam name əsasında kısalmış ad formatı
 * @param fullName Tam ad
 * @returns Kısalmış ad (Məsələn: "Əhməd Məmmədov" -> "Ə. Məmmədov")
 */
export const formatShortName = (fullName: string): string => {
  if (!fullName) return '';
  
  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0];
  }
  
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  
  return `${firstName.charAt(0)}. ${lastName}`;
};

/**
 * Faiz dəyərini vizual formatda qaytarır
 * @param percentage Faiz dəyəri (0-100 arası)
 * @returns Formatlanmış faiz mətni
 */
export const formatPercentage = (percentage: number): string => {
  if (isNaN(percentage)) return '0%';
  
  // 2 reqemli yuvarlaqlaşdırma
  const roundedPercentage = Math.round(percentage * 100) / 100;
  
  return `${roundedPercentage}%`;
};

/**
 * Tarix formatını kontrol edir və düzgün formata çevirir
 * @param dateStr Tarix string formatında
 * @returns Formatlanmış tarix
 */
export const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Əgər tarix ISO formatında deyilsə, standart formata çeviririk
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // keçərsiz tarix formatı, olduğu kimi qaytar
    }
    return formatDate(date);
  } catch (_e) {
    return dateStr; // xəta baş verdiyində, olduğu kimi qaytar
  }
};

/**
 * Mövcud URL-dən query parametrlərini əldə etmək
 * @param paramName Query parametr adı
 * @returns Parametr dəyəri və ya undefined
 */
export const getQueryParam = (paramName: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
};

/**
 * Fərqli tarixi formatlar üçün ümumi formatlaşdırma
 * @param date Tarix (string, Date və ya undefined)
 * @returns Formatlanmış tarix
 */
export const formatDateSafe = (date: string | Date | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return ''; // Invalid date
    
    return formatDate(dateObj);
  } catch (_e) {
    return '';
  }
};
