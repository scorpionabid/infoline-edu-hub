
import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useBreakpoint(breakpoint: Breakpoint) {
  const [state, setState] = useState({
    isSmaller: false,
    isLarger: false,
    isEqual: false,
    isDesktop: false,
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const windowWidth = window.innerWidth;
      const breakpointValue = breakpoints[breakpoint];
      
      const isSmaller = windowWidth < breakpointValue;
      const isLarger = windowWidth > breakpointValue;
      const isEqual = windowWidth === breakpointValue;
      const isDesktop = windowWidth >= breakpoints.md;

      setState({
        isSmaller,
        isLarger,
        isEqual,
        isDesktop,
      });
    };

    // İlkin yoxlama
    checkScreenSize();
    
    // Ekran ölçüsü dəyişdikdə yenidən yoxlama
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [breakpoint]);

  return state;
}
