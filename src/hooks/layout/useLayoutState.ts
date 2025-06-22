import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/common/useLocalStorageHook';
import { useMobile } from '@/hooks/common/useMobile';

interface LayoutState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

export const useLayoutState = (): LayoutState => {
  const isMobile = useMobile();
  
  // Desktop-də sidebar default açıq, mobile-də bağlı
  const [sidebarOpen, setSidebarOpenState] = useState(false);
  
  // Sidebar state-ni localStorage-da saxla (yalnız desktop üçün)
  const [sidebarPreference, setSidebarPreference] = useLocalStorage('sidebar-open', true);

  // Mobile/desktop dəyişəndə sidebar state-ni yeniləmək
  useEffect(() => {
    if (isMobile) {
      // Mobile-də həmişə bağlı başla
      setSidebarOpenState(false);
    } else {
      // Desktop-də user preference-ə əsasən
      setSidebarOpenState(sidebarPreference);
    }
  }, [isMobile, sidebarPreference]);

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
    
    // Desktop-də preference-i saxla
    if (!isMobile) {
      setSidebarPreference(open);
    }
  }, [isMobile, setSidebarPreference]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, [setSidebarOpen]);

  return {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar
  };
};