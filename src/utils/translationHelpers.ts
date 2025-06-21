
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

// Helper function to safely handle translation with object parameters
export const translateWithData = (translationFn: ((key: string, fallback?: string) => string) | undefined, key: string, data?: any, fallback?: string): string => {
  if (typeof translationFn === 'function') {
    if (typeof data === 'object' && data !== null) {
      // Format the data object into a string representation
      const formattedData = formatTranslationData(data);
      return translationFn(key, formattedData) || fallback || key;
    }
    return translationFn(key, fallback);
  }
  return fallback || key;
};
