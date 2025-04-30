
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind siniflərini birləşdirmək üçün köməkçi funksiya
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Status badge rəngləri üçün köməkçi funksiya
export function getBadgeVariantFromStatus(status: string): 'default' | 'destructive' | 'warning' | 'success' | 'info' | 'outline' | 'secondary' {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'secondary';
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'destructive';
    case 'draft':
      return 'outline';
    default:
      return 'default';
  }
}

// Genişlik məhdudiyyəti üçün köməkçi funksiya
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  
  return text.length > maxLength 
    ? `${text.substring(0, maxLength)}...` 
    : text;
}

// İstifadəçi adından avatar üçün baş hərfləri almaq
export function getNameInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  return parts[0][0].toUpperCase();
}

// Formatlı mətn üçün
export function formatNumber(number: number | string | null | undefined): string {
  if (number === null || number === undefined || number === '') return '';
  
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(num)) return '';
  
  return new Intl.NumberFormat('az-AZ').format(num);
}

// Data statusları üçün mətnlər
export function getStatusText(status: string, t: (key: string) => string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return t('active');
    case 'inactive':
      return t('inactive');
    case 'pending':
      return t('pending');
    case 'approved':
      return t('approved');
    case 'rejected':
      return t('rejected');
    case 'draft':
      return t('draft');
    default:
      return status;
  }
}
