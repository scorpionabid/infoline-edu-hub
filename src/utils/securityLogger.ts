
export interface LogContext {
  userAgent?: string;
  timestamp?: string;
  clientId?: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  action?: string;
  resource?: string;
  details?: Record<string, any>;
  field?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  metadata?: Record<string, any>;
  value?: any;
  severity?: string;
  original?: any;
  sanitized?: any;
}

export interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'data_access' | 'system' | 'user_action';
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  context: LogContext;
  timestamp: string;
}

export const securityLogger = {
  logSecurityEvent: (event: string | SecurityEvent, context?: LogContext) => {
    if (typeof event === 'string') {
      console.log('[SECURITY]', event, context);
    } else {
      console.log('[SECURITY]', event);
    }
  },
  
  logRateLimit: (action: string, context?: LogContext) => {
    console.log('[RATE_LIMIT]', action, context);
  },
  
  logError: (error: Error | string, context?: LogContext) => {
    console.error('[SECURITY_ERROR]', error, context);
  },
  
  logValidationFailure: (field: string, value?: string, context?: LogContext) => {
    console.warn('[VALIDATION_FAILURE]', field, value, context);
  },
  
  logSuspiciousActivity: (activity: string, context?: LogContext) => {
    console.warn('[SUSPICIOUS_ACTIVITY]', activity, context);
  },

  logAuthEvent: (event: string, context?: LogContext) => {
    console.log('[AUTH_EVENT]', event, context);
  }
};

export const getClientContext = (): LogContext => ({
  userAgent: navigator?.userAgent || 'unknown',
  timestamp: new Date().toISOString(),
  clientId: 'web-client'
});
