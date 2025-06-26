
export interface LogContext {
  userId?: string;
  action?: string;
  timestamp?: number;
  userAgent?: string;
  ip?: string;
}

export const securityLogger = {
  logRateLimit: (action: string, context: LogContext) => {
    console.warn(`[SECURITY] Rate limit: ${action}`, context);
  },
  
  logValidationFailure: (field: string, value: string, context: LogContext) => {
    console.warn(`[SECURITY] Validation failed: ${field}`, { field, value: value.substring(0, 50), ...context });
  },
  
  logSuspiciousActivity: (type: string, details: any) => {
    console.warn(`[SECURITY] Suspicious activity: ${type}`, details);
  },
  
  logAuthEvent: (event: string, context: LogContext) => {
    console.info(`[AUTH] ${event}`, context);
  },

  logSecurityEvent: (event: string, context: LogContext & { severity?: string }) => {
    console.info(`[SECURITY] ${event}`, context);
  },

  logError: (error: any, context: LogContext & { action?: string; fileName?: string }) => {
    console.error(`[ERROR] ${context.action || 'Unknown action'}`, { error: error.message || error, ...context });
  }
};

export const getClientContext = (): LogContext => ({
  timestamp: Date.now(),
  userAgent: navigator.userAgent,
  ip: 'client'
});
