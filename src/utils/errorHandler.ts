
export const handleError = (error: any, context?: string) => {
  console.error(`Error ${context ? `in ${context}` : ''}:`, error);
  
  // Return a user-friendly error message
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const logError = (error: any, context?: string) => {
  console.error(`[${new Date().toISOString()}] Error ${context ? `in ${context}` : ''}:`, error);
};

export default { handleError, logError };
