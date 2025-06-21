
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  text: (text: string): boolean => {
    const suspiciousPatterns = [
      /<script/i, /javascript:/i, /vbscript:/i,
      /on\w+\s*=/i, /eval\s*\(/i, /expression\s*\(/i
    ];
    return !suspiciousPatterns.some(pattern => pattern.test(text));
  }
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const generateCSRFToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
