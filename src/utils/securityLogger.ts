/**
 * Enhanced Security Logger with Comprehensive Monitoring
 * Tracks security events, authentication attempts, and suspicious activities
 */

import { ENV } from '@/config/environment';

interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityEvent {
  timestamp: string;
  level: 'SECURITY' | 'AUTH' | 'DATA' | 'RATE_LIMIT' | 'VALIDATION' | 'ERROR';
  event: string;
  context: LogContext;
  data?: any;
  fingerprint?: string;
}

class SecurityLogger {
  private isDevelopment = ENV.features.enableDebugMode;
  private logBuffer: SecurityEvent[] = [];
  private maxBufferSize = 100;

  // Generate event fingerprint for deduplication
  private generateFingerprint(event: string, context: LogContext): string {
    const data = `${event}_${context.userId}_${context.action}_${context.resource}`;
    return btoa(data).slice(0, 16);
  }

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
      'pin',
      'ssn',
      'credit',
      'card',
    ];
    
    return sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field)
    );
  }

  // Core logging method
  private log(level: SecurityEvent['level'], event: string, context: LogContext, data?: any): void {
    const logEntry: SecurityEvent = {
      timestamp: new Date().toISOString(),
      level,
      event,
      context: this.sanitizeLogData(context),
      data: data ? this.sanitizeLogData(data) : undefined,
      fingerprint: this.generateFingerprint(event, context),
    };

    // Add to buffer
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Console logging in development
    if (this.isDevelopment) {
      const logMethod = level === 'ERROR' ? console.error : console.log;
      logMethod(`[${level}]`, logEntry);
    }

    // Send to monitoring system
    this.sendToMonitoring(logEntry);
  }

  // Log security events
  logSecurityEvent(event: string, context: LogContext, data?: any): void {
    this.log('SECURITY', event, { ...context, severity: context.severity || 'medium' }, data);
  }

  // Log authentication events
  logAuthEvent(
    event: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'session_expired' | 'password_reset',
    context: LogContext
  ): void {
    const severity = event === 'login_failure' ? 'high' : 'medium';
    this.log('AUTH', `auth.${event}`, { ...context, severity }, undefined);
  }

  // Log data access events
  logDataAccess(resource: string, action: 'read' | 'write' | 'delete' | 'export', context: LogContext): void {
    const severity = action === 'delete' || action === 'export' ? 'high' : 'low';
    this.log('DATA', `data.${action}`, { ...context, resource, severity });
  }

  // Log rate limiting events
  logRateLimit(action: string, context: LogContext): void {
    this.log('RATE_LIMIT', 'rate_limit.exceeded', { ...context, action, severity: 'high' });
  }

  // Log validation failures
  logValidationFailure(field: string, value: string, context: LogContext): void {
    this.log('VALIDATION', 'validation.failure', {
      ...context,
      field,
      value: value.substring(0, 50), // Limit value length
      severity: 'medium'
    });
  }

  // Log suspicious activities
  logSuspiciousActivity(activity: string, context: LogContext, data?: any): void {
    this.log('SECURITY', `suspicious.${activity}`, { ...context, severity: 'high' }, data);
  }

  // Log error without sensitive data
  logError(error: Error | string, context: LogContext): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: ENV.features.enableDebugMode ? error.stack : undefined }
      : { message: error };

    this.log('ERROR', 'error.occurred', { ...context, severity: 'high' }, errorData);
  }

  // Get security metrics
  getSecurityMetrics(timeframe: number = 3600000): { // 1 hour default
    authAttempts: number;
    failedLogins: number;
    rateLimitViolations: number;
    validationFailures: number;
    suspiciousActivities: number;
  } {
    const cutoff = new Date(Date.now() - timeframe).toISOString();
    const recentLogs = this.logBuffer.filter(log => log.timestamp > cutoff);

    return {
      authAttempts: recentLogs.filter(log => log.level === 'AUTH').length,
      failedLogins: recentLogs.filter(log => log.event === 'auth.login_failure').length,
      rateLimitViolations: recentLogs.filter(log => log.level === 'RATE_LIMIT').length,
      validationFailures: recentLogs.filter(log => log.level === 'VALIDATION').length,
      suspiciousActivities: recentLogs.filter(log => log.event.startsWith('suspicious.')).length,
    };
  }

  // Get recent security events
  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.logBuffer.slice(-limit);
  }

  // Clear log buffer
  clearLogs(): void {
    this.logBuffer = [];
  }

  private sendToMonitoring(logEntry: SecurityEvent): void {
    // In production, send to monitoring service
    if (ENV.app.environment === 'production') {
      // TODO: Implement actual monitoring service integration
      // For now, store in sessionStorage with size limits
      try {
        const logs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
        logs.push(logEntry);
        // Keep only last 100 logs in production
        const trimmedLogs = logs.slice(-100);
        sessionStorage.setItem('security_logs', JSON.stringify(trimmedLogs));
      } catch (error) {
        // Fail silently in production
      }
    } else {
      // Development: store more logs
      try {
        const logs = JSON.parse(sessionStorage.getItem('security_logs') || '[]');
        logs.push(logEntry);
        const trimmedLogs = logs.slice(-200);
        sessionStorage.setItem('security_logs', JSON.stringify(trimmedLogs));
      } catch (error) {
        console.warn('Failed to store security log:', error);
      }
    }
  }
}

export const securityLogger = new SecurityLogger();

// Utility function to get client context
export const getClientContext = (): LogContext => ({
  userAgent: navigator.userAgent,
  sessionId: sessionStorage.getItem('session_id') || 'anonymous',
  // Note: Getting real IP requires server-side implementation
  ip: 'client-side',
});

// Security monitoring hook
export const useSecurityMonitoring = () => {
  const logSecurityEvent = (event: string, context: Partial<LogContext> = {}) => {
    securityLogger.logSecurityEvent(event, { ...getClientContext(), ...context });
  };

  const logSuspiciousActivity = (activity: string, data?: any) => {
    securityLogger.logSuspiciousActivity(activity, getClientContext(), data);
  };

  return {
    logSecurityEvent,
    logSuspiciousActivity,
    getMetrics: () => securityLogger.getSecurityMetrics(),
    getRecentEvents: () => securityLogger.getRecentEvents(),
  };
};

export default securityLogger;
