
import { useState, useEffect } from 'react';

/**
 * Media sorğusu əsasında ekranın ölçüsünü izləmək üçün hook
 * @param query Media sorğusu (ör: '(max-width: 768px)')
 * @returns {boolean} Sorğu uyğundursa true, əks halda false
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // İlkin yoxlama
    setMatches(mediaQuery.matches);
    
    // Dinləyici 
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // MediaQueryList-ə dinləyici əlavə et
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      // Köhnə brauzerləri dəstəkləmək üçün
      mediaQuery.addListener(handleChange);
      
      return () => {
        mediaQuery.removeListener(handleChange);
      };
    }
  }, [query]);
  
  return matches;
};

export default useMediaQuery;
