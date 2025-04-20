
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const updateMatches = () => setMatches(mediaQuery.matches);
    
    // İlkin dəyəri təyin et
    updateMatches();
    
    // Dəyişiklikləri dinlə
    mediaQuery.addEventListener('change', updateMatches);
    
    // Təmizləmə
    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
}
