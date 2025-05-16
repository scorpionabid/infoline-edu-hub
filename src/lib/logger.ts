
/**
 * Enhanced logger with better debugging capabilities
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  tags?: string[];
  data?: any;
}

// Only log in development or when debug is explicitly enabled
const isDebugEnabled = process.env.NODE_ENV === 'development' || localStorage.getItem('debug') === 'true';

// Create a styled console logger
const logger = {
  debug: (message: string, options?: LogOptions) => {
    if (!isDebugEnabled) return;
    logWithLevel('debug', message, options);
  },
  
  info: (message: string, options?: LogOptions) => {
    if (!isDebugEnabled) return;
    logWithLevel('info', message, options);
  },
  
  warn: (message: string, options?: LogOptions) => {
    logWithLevel('warn', message, options);
  },
  
  error: (message: string, error?: any, options?: LogOptions) => {
    const enhancedOptions = { ...options };
    
    if (error) {
      if (error instanceof Error) {
        enhancedOptions.data = { 
          ...enhancedOptions.data,
          errorMessage: error.message,
          stack: error.stack,
          name: error.name
        };
      } else {
        enhancedOptions.data = { ...enhancedOptions.data, error };
      }
    }
    
    logWithLevel('error', message, enhancedOptions);
  },
  
  // Grouped logging for related operations
  group: (groupName: string, fn: () => void) => {
    if (!isDebugEnabled) {
      fn();
      return;
    }
    
    console.group(`🔍 ${groupName}`);
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  },
  
  // Time an operation
  time: async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    if (!isDebugEnabled) {
      return await fn();
    }
    
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`⏱️ ${label} (failed after ${duration.toFixed(2)}ms):`, error);
      throw error;
    }
  }
};

// Helper function for consistent log formatting
function logWithLevel(level: LogLevel, message: string, options?: LogOptions) {
  const { context, tags = [], data } = options || {};
  
  const emoji = {
    debug: '🐛',
    info: 'ℹ️',
    warn: '⚠️',
    error: '🔥'
  };
  
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
  const contextStr = context ? `[${context}]` : '';
  const tagsStr = tags.length > 0 ? tags.map(t => `#${t}`).join(' ') : '';
  
  const formattedMessage = `${emoji[level]} ${timestamp} ${contextStr} ${message} ${tagsStr}`;
  
  switch (level) {
    case 'debug':
      console.debug(formattedMessage, data ? data : '');
      break;
    case 'info':
      console.info(formattedMessage, data ? data : '');
      break;
    case 'warn':
      console.warn(formattedMessage, data ? data : '');
      break;
    case 'error':
      console.error(formattedMessage, data ? data : '');
      break;
  }
}

export default logger;
