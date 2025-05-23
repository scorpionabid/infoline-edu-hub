import { toast } from 'sonner';

/**
 * Tətbiqdə xətaları standart şəkildə idarə etmək üçün hook
 * 
 * Bu hook xətaları idarə etmək üçün vahid bir interfeys təqdim edir.
 * Xətaların həm konsola yazılmasını, həm də istifadəçiyə göstərilməsini təmin edir.
 * 
 * @param scope - Xətanın hansı modulda baş verdiyini göstərən ad 
 * @returns Xəta emalı funksiyası
 * 
 * @example
 * const { handleError } = useErrorHandler('DataEntry');
 * try {
 *   // Əməliyyatlar
 * } catch (error) {
 *   handleError(error, 'Məlumatlar yüklənərkən xəta baş verdi');
 * }
 */
export function useErrorHandler(scope: string) {
  /**
   * Xətanı idarə etmək üçün əsas funksiya
   * 
   * @param error - Xəta obyekti
   * @param message - İstifadəçiyə göstəriləcək mesaj (varsa). Əgər təqdim edilməzsə, 
   *                  xəta obyektindən mesaj istifadə ediləcək
   */
  const handleError = (error: any, message?: string) => {
    // Xətanı konsola yazırıq (development mühitində diaqnostika üçün)
    console.error(`[${scope}] Error:`, error);
    
    // Xəta mesajını formalaşdırırıq
    const errorMessage = message || 
      (error?.message ? `${scope}: ${error.message}` : `${scope}: Naməlum xəta`);
    
    // İstifadəçiyə xəta bildirişi göstəririk
    toast.error(errorMessage);
  };
  
  return { handleError };
}

export default useErrorHandler;
