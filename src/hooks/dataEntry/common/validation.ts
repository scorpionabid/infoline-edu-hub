
// Data entry validation utilities
export const validateRequired = (value: any): boolean => {
  return value !== undefined && value !== null && value !== '';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateNumber = (value: any): boolean => {
  return !isNaN(Number(value));
};
