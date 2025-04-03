
import { format, formatDistanceToNow, formatRelative } from 'date-fns';
import { az } from 'date-fns/locale';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd.MM.yyyy');
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd.MM.yyyy HH:mm');
};

export const formatDateTimeWithSeconds = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd.MM.yyyy HH:mm:ss');
};

export const formatDateToLocale = (date: Date | string, showYear = true): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, showYear ? 'dd MMMM yyyy' : 'dd MMMM', { locale: az });
};

export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatRelative(dateObj, new Date(), { locale: az });
};

export const formatDistanceDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: az });
};

export const isDateAfter = (date: Date | string, compareDate: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const compareDateObj = typeof compareDate === 'string' ? new Date(compareDate) : compareDate;
  return dateObj > compareDateObj;
};

export const isDateBefore = (date: Date | string, compareDate: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const compareDateObj = typeof compareDate === 'string' ? new Date(compareDate) : compareDate;
  return dateObj < compareDateObj;
};

export const addDays = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj;
};

export const subtractDays = (date: Date | string, days: number): Date => {
  return addDays(date, -days);
};
