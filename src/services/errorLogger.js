/**
 * ErrorLogger - Comprehensive error logging service
 * Tracks, stores, and reports errors throughout the application
 */

const ERROR_LOG_KEY = 'counterOS_error_logs';
const MAX_ERROR_HISTORY = 50;

export const ErrorLogger = {
  /**
   * Log an error with context information
   * @param {Error} error - The error object
   * @param {Object} context - Additional context data
   * @returns {string} - Unique error ID
   */
  logError: (error, context = {}) => {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorLog = {
      id: errorId,
      timestamp: new Date().toISOString(),
      message: error?.message || 'Unknown error',
      stack: error?.stack || '',
      type: error?.name || 'Error',
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      }
    };

    // Store in localStorage
    try {
      const logs = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]');
      logs.unshift(errorLog);
      
      // Keep only recent errors
      if (logs.length > MAX_ERROR_HISTORY) {
        logs.pop();
      }
      
      localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }

    // Console log in development
    if (import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')) {
      console.error(`[${errorId}] ${error?.message}`, error);
    }

    // Could integrate with external error tracking service here
    // Example: Sentry, LogRocket, Bugsnag
    ErrorLogger.sendToMonitoring(errorLog);

    return errorId;
  },

  /**
   * Log API error with special handling
   */
  logAPIError: (endpoint, error, statusCode = null, responseData = null) => {
    return ErrorLogger.logError(error, {
      type: 'API_ERROR',
      endpoint,
      statusCode,
      responseData: responseData?.slice?.(0, 200) // Truncate large responses
    });
  },

  /**
   * Log AI service errors
   */
  logAIError: (serviceName, error, prompt = null) => {
    return ErrorLogger.logError(error, {
      type: 'AI_ERROR',
      service: serviceName,
      promptLength: prompt?.length || 0,
      context: 'AI service call failed'
    });
  },

  /**
   * Get error history
   */
  getErrorHistory: () => {
    try {
      return JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]');
    } catch (e) {
      return [];
    }
  },

  /**
   * Clear error history
   */
  clearErrorHistory: () => {
    try {
      localStorage.removeItem(ERROR_LOG_KEY);
    } catch (e) {
      console.error('Failed to clear error logs:', e);
    }
  },

  /**
   * Get error statistics
   */
  getErrorStats: () => {
    const logs = ErrorLogger.getErrorHistory();
    
    const stats = {
      total: logs.length,
      byType: {},
      recent: logs.slice(0, 5),
      mostCommon: null
    };

    logs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    });

    // Find most common error
    let maxCount = 0;
    let mostCommon = null;
    Object.entries(stats.byType).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = type;
      }
    });
    stats.mostCommon = mostCommon;

    return stats;
  },

  /**
   * Export error logs (for debugging)
   */
  exportLogs: () => {
    const logs = ErrorLogger.getErrorHistory();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `error-logs-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  /**
   * Send error to monitoring service (placeholder)
   */
  sendToMonitoring: async (errorLog) => {
    // This is where you'd integrate with services like:
    // - Sentry: Sentry.captureException()
    // - LogRocket: logRocket.captureException()
    // - Custom backend: POST /api/errors
    
    // For now, just log in dev mode
    if (import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')) {
      console.group('📊 Error Monitoring');
      console.log('Error ID:', errorLog.id);
      console.log('Message:', errorLog.message);
      console.log('Context:', errorLog.context);
      console.groupEnd();
    }
  },

  /**
   * Create safe error handler wrapper
   */
  safeAsync: (fn) => {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        ErrorLogger.logError(error, {
          context: 'safeAsync wrapper',
          functionName: fn.name
        });
        throw error; // Re-throw for caller to handle UI feedback
      }
    };
  }
};
