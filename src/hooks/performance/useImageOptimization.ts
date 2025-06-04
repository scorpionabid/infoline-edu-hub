
import { useState, useEffect, useRef } from 'react';

interface ImageOptimizationOptions {
  lazy?: boolean;
  placeholder?: string;
  quality?: number;
  fallback?: string;
}

export const useImageOptimization = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  const {
    lazy = true,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+',
    quality = 85,
    fallback = '/images/default-placeholder.svg'
  } = options;

  const [imageSrc, setImageSrc] = useState(lazy ? placeholder : src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!lazy) {
      loadImage(src);
      return;
    }

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, lazy]);

  const loadImage = (source: string) => {
    setIsLoading(true);
    setError(false);

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(source);
      setIsLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setImageSrc(fallback);
      setIsLoading(false);
    };

    img.src = source;
  };

  return {
    imgRef,
    src: imageSrc,
    isLoading,
    error,
    reload: () => loadImage(src)
  };
};
