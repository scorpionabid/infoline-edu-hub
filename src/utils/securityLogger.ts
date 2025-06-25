
interface LogContext {
  userAgent?: string;
  ipAddress?: string;
  userId?: string;
  timestamp?: string;
  [key: string]: any;
}

interface SecurityEvent {
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  details?: any;
  timestamp: string;
}

export const getClientContext = (): LogContext => {
  return {
    userAgent: navigator?.userAgent || 'unknown',
    ipAddress: 'client', // Client-side can't get real IP
    timestamp: new Date().toISOString()
  };
};

export const securityLogger = {
  logRateLimit: (action: string, context: LogContext) => {
    console.warn('Rate limit exceeded:', { action, context });
    // In production, send to monitoring service
  },

  logValidationFailure: (field: string, value: string, context: LogContext) => {
    console.warn('Validation failure:', { field, value: value.substring(0, 50), context });
    // In production, send to monitoring service
  },

  logSuspiciousActivity: (type: string, details: any) => {
    console.warn('Suspicious activity detected:', { type, details });
    // In production, send to monitoring service
  },

  logAuthEvent: (event: string, context: LogContext) => {
    console.info('Auth event:', { event, context });
    // In production, send to monitoring service
  },

  logSecurityEvent: (action: string, context: LogContext & { severity?: string }) => {
    const event: SecurityEvent = {
      action,
      severity: (context.severity as any) || 'medium',
      userId: context.userId,
      details: context,
      timestamp: new Date().toISOString()
    };
    
    console.warn('Security event:', event);
    // In production, send to monitoring service
  },

  logError: (error: Error, context: LogContext) => {
    console.error('Security-related error:', {
      message: error.message,
      stack: error.stack,
      context
    });
    // In production, send to monitoring service
  }
};
