
import { useState, useEffect, useCallback } from 'react';

interface UseImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
  placeholder?: string;
}

/**
 * Hook for optimizing image loading and display
 */
export const useImageOptimization = (
  src: string,
  options: UseImageOptimizationOptions = {}
) => {
  const { quality = 80, format = 'webp', lazy = true, placeholder } = options;
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);
  
  // Optimize image URL (if using a CDN that supports query parameters)
  const optimizedSrc = useCallback(() => {
    if (!src) return '';
    
    const url = new URL(src, window.location.origin);
    
    // Add optimization parameters (adjust based on your CDN)
    if (quality !== 80) {
      url.searchParams.set('quality', quality.toString());
    }
    
    if (format !== 'jpeg') {
      url.searchParams.set('format', format);
    }
    
    return url.toString();
  }, [src, quality, format]);
  
  // Preload image
  useEffect(() => {
    if (!inView || !src) return;
    
    const img = new Image();
    
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    img.src = optimizedSrc();
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [inView, src, optimizedSrc]);
  
  // Intersection observer for lazy loading
  const ref = useCallback((node: HTMLElement | null) => {
    if (!lazy || !node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(node);
    
    return () => observer.disconnect();
  }, [lazy]);
  
  return {
    src: loaded ? optimizedSrc() : placeholder,
    loaded,
    error,
    ref,
  };
};
