
/**
 * Enhanced Input Validation and Sanitization
 * Comprehensive security utilities for all user inputs
 */

import { sanitizeInput, validateInput } from '@/config/security';

// Enhanced validation patterns
const ENHANCED_PATTERNS = {
  sqlInjection: /('|(\\')|(;)|(\s*(union|select|insert|update|delete|drop|create|alter|exec|script|declare|cast|convert)\s*)/gi,
  xssAdvanced: /<[^>]*script[^>]*>|javascript:|vbscript:|on\w+\s*=|data:text\/html|expression\s*\(|eval\s*\(|setTimeout\s*\(|setInterval\s*\(/gi,
  nosqlInjection: /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$regex|\$or|\$and)/gi,
  pathTraversal: /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\\)/gi,
  commandInjection: /(\||&|;|`|\$\(|\${|<|>)/g,
  htmlEntities: /&[a-zA-Z0-9#]+;/g
} as const;

/**
 * Advanced input sanitization
 */
export const advancedSanitize = (input: string, options: {
  allowHtml?: boolean;
  maxLength?: number;
  stripWhitespace?: boolean;
} = {}): string => {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input;
  
  // Basic sanitization first
  sanitized = sanitizeInput(sanitized);
  
  // Advanced XSS protection
  sanitized = sanitized.replace(ENHANCED_PATTERNS.xssAdvanced, '');
  
  // SQL injection protection
  sanitized = sanitized.replace(ENHANCED_PATTERNS.sqlInjection, '');
  
  // NoSQL injection protection
  sanitized = sanitized.replace(ENHANCED_PATTERNS.nosqlInjection, '');
  
  // Path traversal protection
  sanitized = sanitized.replace(ENHANCED_PATTERNS.pathTraversal, '');
  
  // Command injection protection
  sanitized = sanitized.replace(ENHANCED_PATTERNS.commandInjection, '');
  
  // Length limit
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  // Strip excessive whitespace
  if (options.stripWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
  }
  
  return sanitized;
};

/**
 * Validate notification content
 */
export const validateNotificationContent = (content: {
  title: string;
  message?: string;
  type: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Title validation
  if (!content.title || content.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (content.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  } else if (ENHANCED_PATTERNS.xssAdvanced.test(content.title)) {
    errors.push('Title contains invalid characters');
  }
  
  // Message validation
  if (content.message) {
    if (content.message.length > 1000) {
      errors.push('Message must be less than 1000 characters');
    } else if (ENHANCED_PATTERNS.xssAdvanced.test(content.message)) {
      errors.push('Message contains invalid characters');
    }
  }
  
  // Type validation
  const validTypes = ['info', 'warning', 'error', 'success', 'data_approval', 'deadline_reminder', 'proxy_data_entry', 'system_update'];
  if (!validTypes.includes(content.type)) {
    errors.push('Invalid notification type');
  }
  
  return {
    isValid: errors.length === 0,
    // errors
  };
};

/**
 * Enhanced file validation
 */
export const validateFileSecure = (file: File): { valid: boolean; error?: string; warnings?: string[] } => {
  const warnings: string[] = [];
  
  // Basic validation from security config
  const basicValidation = validateInput.filename(file.name);
  if (!basicValidation) {
    return { valid: false, error: 'Invalid filename' };
  }
  
  // File size check (enhanced)
  const maxSize = 15 * 1024 * 1024; // 15MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 15MB limit' };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  
  // Enhanced MIME type validation
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  // File extension validation
  const extension = file.name.toLowerCase().split('.').pop();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx'];
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'File extension not allowed' };
  }
  
  // MIME type and extension mismatch check
  const extensionMimeMap: Record<string, string[]> = {
    'jpg': ['image/jpeg'],
    'jpeg': ['image/jpeg'],
    'png': ['image/png'],
    'gif': ['image/gif'],
    'webp': ['image/webp'],
    'pdf': ['application/pdf'],
    'txt': ['text/plain'],
    'doc': ['application/msword'],
    'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'xls': ['application/vnd.ms-excel'],
    'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  };
  
  const expectedMimes = extensionMimeMap[extension];
  if (expectedMimes && !expectedMimes.includes(file.type)) {
    warnings.push('File extension and MIME type mismatch detected');
  }
  
  // Suspicious filename patterns
  const suspiciousPatterns = [
    /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, /\.pif$/i,
    /\.jar$/i, /\.js$/i, /\.php$/i, /\.asp$/i, /\.jsp$/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    return { valid: false, error: 'Suspicious file type detected' };
  }
  
  return { 
    valid: true, 
    warnings: warnings.length > 0 ? warnings : undefined 
  };
};

/**
 * Rate limiting for security-sensitive operations
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkSecurityRateLimit = (
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remainingAttempts: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  if (record.count >= maxAttempts) {
    return { allowed: false, remainingAttempts: 0 };
  }
  
  record.count++;
  return { allowed: true, remainingAttempts: maxAttempts - record.count };
};

export default {
  advancedSanitize,
  validateNotificationContent,
  validateFileSecure,
  // checkSecurityRateLimit
};
