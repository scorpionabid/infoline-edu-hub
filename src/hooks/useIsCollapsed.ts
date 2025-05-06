
import { useState, useEffect } from 'react';

export const useIsCollapsed = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Mövcud ekran ölçüsünə əsasən ilkin vəziyyəti təyin edir
  useEffect(() => {
    const checkScreenSize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    
    // İlkin yoxlama
    checkScreenSize();
    
    // Ekran ölçüsü dəyişəndə yenidən yoxla
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  
  return { isCollapsed, toggleCollapse };
};

export default useIsCollapsed;
