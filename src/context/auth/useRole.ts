
import { useAuth } from './useAuth';

/**
 * İstifadəçi rolunu əldə etmək üçün hook
 * @param {string | string[]} rolesToCheck - Yoxlanılacaq rol(lar) (ixtiyari)
 * @returns {boolean} - İstifadəçi verilmiş rola sahibdirsə true
 */
export const useRole = (rolesToCheck?: string | string[]): boolean => {
  const { user } = useAuth();
  
  if (!user || !user.role) return false;
  
  // Əgər heç bir rol yoxlanılmırsa, mövcud rolu qaytarırıq
  if (!rolesToCheck) return true;
  
  // Əgər yoxlanılacaq bir rol massividir
  if (Array.isArray(rolesToCheck)) {
    return rolesToCheck.includes(user.role);
  }
  
  // Əgər yoxlanılacaq tək roldursa
  return user.role === rolesToCheck;
};
