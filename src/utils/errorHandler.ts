
export const handleError = (error: any) => {
  // Log the error for debugging purposes
  console.error('Error occurred:', error);

  // Return a user-friendly error message
  if (typeof error === 'object' && error !== null) {
    return error.message || 'An unexpected error occurred';
  }

  return 'An unexpected error occurred';
};
