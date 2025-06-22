
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
  }
};

export const getClientContext = (): LogContext => ({
  timestamp: Date.now(),
  userAgent: navigator.userAgent,
  ip: 'client'
});
