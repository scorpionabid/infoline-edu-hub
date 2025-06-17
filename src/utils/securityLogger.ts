/**
 * Security-focused logging utility
 * Removes sensitive information and provides safe error reporting
 */

interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  ip?: string;
  userAgent?: string;
}

class SecurityLogger {
  private isDevelopment = !import.meta.env.PROD;

  // Sanitize data before logging to prevent log injection
  private sanitizeLogData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/[\r\n\t]/g, ' ').substring(0, 1000);
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Remove sensitive fields
        if (this.isSensitiveField(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeLogData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'credential',
      'session',
      'cookie',
    ];
    
    return sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field)
    );
  }

  // Log security events
  logSecurityEvent(event: string, context: LogContext, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'SECURITY',
      event,
      context: this.sanitizeLogData(context),
      data: data ? this.sanitizeLogData(data) : undefined,
    };

    if (this.isDevelopment) {
      console.log('[SECURITY]', logEntry);
    }

    // In production, this would send to your security monitoring system
    this.sendToMonitoring(logEntry);
  }

  // Log authentication events
  logAuthEvent(event: 'login_attempt' | 'login_success' | 'login_failure' | 'logout', context: LogContext) {
    this.logSecurityEvent(`auth.${event}`, context);
  }

  // Log data access events
  logDataAccess(resource: string, action: 'read' | 'write' | 'delete', context: LogContext) {
    this.logSecurityEvent(`data.${action}`, { ...context, resource });
  }

  // Log rate limiting events
  logRateLimit(action: string, context: LogContext) {
    this.logSecurityEvent('rate_limit.exceeded', { ...context, action });
  }

  // Log validation failures
  logValidationFailure(field: string, value: string, context: LogContext) {
    this.logSecurityEvent('validation.failure', {
      ...context,
      field,
      value: value.substring(0, 50) // Limit value length
    });
  }

  // Log error without sensitive data
  logError(error: Error | string, context: LogContext) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : { message: error };

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      context: this.sanitizeLogData(context),
      error: this.sanitizeLogData(errorData),
    };

    if (this.isDevelopment) {
      console.error('[ERROR]', logEntry);
    }

    this.sendToMonitoring(logEntry);
  }

  private sendToMonitoring(logEntry: any) {
    // In a real application, you would send this to your monitoring service
    // For now, we'll just store it in sessionStorage for debugging
    try {
      const logs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
      logs.push(logEntry);
      // Keep only last 100 logs
      const trimmedLogs = logs.slice(-100);
      sessionStorage.setItem('security_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.warn('Failed to store security log:', error);
    }
  }
}

export const securityLogger = new SecurityLogger();

// Utility function to get client context
export const getClientContext = (): LogContext => ({
  userAgent: navigator.userAgent,
  // Note: Getting real IP requires server-side implementation
  ip: 'client-side',
});
