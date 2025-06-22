
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  text: (text: string): boolean => {
    // Basic XSS prevention
    const dangerousChars = /<script|javascript:|data:|vbscript:/i;
    return !dangerousChars.test(text);
  }
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
