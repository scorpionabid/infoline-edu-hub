
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
  error?: string;
  metadata?: Record<string, any>;
  value?: any;
  severity?: string;
  original?: any;
}

export interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'data_access' | 'system' | 'user_action';
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  context: LogContext;
  timestamp: string;
}

export const securityLogger = {
  logSecurityEvent: (event: SecurityEvent) => {
    console.log('[SECURITY]', event);
  },
  
  logRateLimit: (context: LogContext) => {
    console.log('[RATE_LIMIT]', context);
  },
  
  logError: (error: string, context?: LogContext) => {
    console.error('[SECURITY_ERROR]', error, context);
  },
  
  logValidationFailure: (field: string, context?: LogContext) => {
    console.warn('[VALIDATION_FAILURE]', field, context);
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
