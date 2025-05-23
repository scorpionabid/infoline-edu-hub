import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px altı mobil sayılır
    };

    // İlk render zamanı kontrol et
    checkIsMobile();

    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener('resize', checkIsMobile);

    // Component unmount olduğunda listener'ı temizle
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export default useMobile;
