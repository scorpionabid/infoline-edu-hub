
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  text: (text: string): boolean => {
    // Check for basic XSS patterns
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

export const validateFileSecure = (file: File): FileValidationResult => {
  const maxSize = 15 * 1024 * 1024; // 15MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
};

export const checkSecurityRateLimit = (key: string, maxAttempts: number, windowMs: number) => {
  // Simple in-memory rate limiting for demo
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
  const validAttempts = attempts.filter((time: number) => now - time < windowMs);
  
  if (validAttempts.length >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }
  
  validAttempts.push(now);
  localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validAttempts));
  
  return { allowed: true, remaining: maxAttempts - validAttempts.length };
};
