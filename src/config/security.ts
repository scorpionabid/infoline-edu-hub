
/**
 * Enhanced Security Configuration and Validation
 * Comprehensive security utilities for input validation and CSRF protection
 */

import { ENV } from './environment';

// Input validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
  url: /^https?:\/\/.+/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  sqlInjection: /('|(\\')|(;)|(\s*(union|select|insert|update|delete|drop|create|alter|exec|script)\s*)/i,
  xss: /<[^>]*script[^>]*>|javascript:|on\w+\s*=/i,
  path: /^[a-zA-Z0-9\-_\/\.]+$/,
} as const;

// Dangerous input patterns
const DANGEROUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
];

// CSRF Token Management
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken && token.length === 64;
};

// Input Sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input;
  
  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // HTML encode special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
};

// Input Validation
export const validateInput = {
  email: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    return VALIDATION_PATTERNS.email.test(email.trim());
  },
  
  phone: (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') return false;
    return VALIDATION_PATTERNS.phone.test(phone.trim());
  },
  
  url: (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    return VALIDATION_PATTERNS.url.test(url.trim());
  },
  
  uuid: (uuid: string): boolean => {
    if (!uuid || typeof uuid !== 'string') return false;
    return VALIDATION_PATTERNS.uuid.test(uuid.trim());
  },
  
  password: (password: string): boolean => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  },
  
  text: (text: string, maxLength: number = 1000): boolean => {
    if (!text || typeof text !== 'string') return false;
    if (text.length > maxLength) return false;
    return !VALIDATION_PATTERNS.sqlInjection.test(text) && !VALIDATION_PATTERNS.xss.test(text);
  },
  
  filename: (filename: string): boolean => {
    if (!filename || typeof filename !== 'string') return false;
    return /^[a-zA-Z0-9\-_\.]+$/.test(filename) && filename.length <= 255;
  }
};

// File Upload Validation
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }
  
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  // Check filename
  if (!validateInput.filename(file.name)) {
    return { valid: false, error: 'Invalid filename' };
  }
  
  return { valid: true };
};

// Rate Limiting
interface RateLimitState {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitState: RateLimitState = {};

export const checkRateLimit = (
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remainingAttempts: number; resetTime?: Date } => {
  const now = Date.now();
  const key = `rate_limit_${identifier}`;
  
  if (!rateLimitState[key] || now > rateLimitState[key].resetTime) {
    rateLimitState[key] = {
      count: 1,
      resetTime: now + windowMs
    };
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  rateLimitState[key].count++;
  
  if (rateLimitState[key].count > maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: new Date(rateLimitState[key].resetTime)
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: maxAttempts - rateLimitState[key].count
  };
};

// Environment validation
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required environment variables
  if (!ENV.supabase?.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!ENV.supabase?.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  // Validate URL format
  if (ENV.supabase?.url && !validateInput.url(ENV.supabase.url)) {
    errors.push('VITE_SUPABASE_URL has invalid format');
  }
  
  // Check for development credentials in production
  if (ENV.app?.environment === 'production') {
    if (ENV.supabase?.url?.includes('localhost') || ENV.supabase?.url?.includes('127.0.0.1')) {
      errors.push('Development Supabase URL detected in production');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Security headers middleware
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://*.supabase.co;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://*.supabase.co;
      connect-src 'self' https://*.supabase.co;
      font-src 'self';
      object-src 'none';
      media-src 'self';
      frame-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
};

export default {
  generateCSRFToken,
  validateCSRFToken,
  sanitizeInput,
  validateInput,
  validateFileUpload,
  checkRateLimit,
  validateEnvironment,
  getSecurityHeaders,
};
