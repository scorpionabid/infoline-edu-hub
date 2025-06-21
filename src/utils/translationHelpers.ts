
export const safeTranslate = (translationFn: ((key: string, fallback?: string) => string) | undefined, key: string, fallback?: string): string => {
  if (typeof translationFn === 'function') {
    return translationFn(key, fallback);
  }
  return fallback || key;
};

export const formatTranslationData = (data: any): string => {
  if (typeof data === 'string') {
    return data;
  }
  if (typeof data === 'object' && data !== null) {
    if (data.name) return data.name;
    if (data.email) return data.email;
    if (data.count !== undefined) return data.count.toString();
    if (data.current !== undefined && data.total !== undefined) {
      return `${data.current}/${data.total}`;
    }
  }
  return String(data);
};

// Helper function to safely handle translation with interpolation
export const translateWithInterpolation = (
  translationFn: ((key: string, fallback?: string) => string) | undefined, 
  key: string, 
  data?: Record<string, any>, 
  fallback?: string
): string => {
  if (typeof translationFn === 'function') {
    // For now, just use the base translation function since our system doesn't support interpolation yet
    // In the future, this can be enhanced to handle template strings
    return translationFn(key, fallback);
  }
  return fallback || key;
};

// Legacy function for backwards compatibility
export const translateWithData = translateWithInterpolation;
