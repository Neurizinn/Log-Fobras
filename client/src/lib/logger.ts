export type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  details?: Record<string, any>;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
}

class ClientLogger {
  private async sendLog(level: LogLevel, message: string, context?: LogContext) {
    try {
      await fetch("/api/logs/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          message,
          details: context?.details ? JSON.stringify(context.details) : undefined,
          stackTrace: context?.stackTrace,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      // Fallback to console if API fails
      console.error("Failed to send log to server:", error);
      console.log(`[CLIENT] [${level.toUpperCase()}] ${message}`, context);
    }
  }

  info(message: string, context?: LogContext) {
    console.log(`[CLIENT] [INFO] ${message}`, context);
    return this.sendLog("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    console.warn(`[CLIENT] [WARN] ${message}`, context);
    return this.sendLog("warn", message, context);
  }

  error(message: string, context?: LogContext) {
    console.error(`[CLIENT] [ERROR] ${message}`, context);
    return this.sendLog("error", message, context);
  }

  debug(message: string, context?: LogContext) {
    console.debug(`[CLIENT] [DEBUG] ${message}`, context);
    return this.sendLog("debug", message, context);
  }

  // Helper to log JavaScript errors
  logError(error: Error, additionalContext?: Record<string, any>) {
    const message = `JavaScript Error: ${error.message}`;
    const context = {
      details: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...additionalContext,
      },
      stackTrace: error.stack,
    };
    return this.error(message, context);
  }

  // Helper to log user actions
  logUserAction(action: string, details?: Record<string, any>) {
    const message = `User Action: ${action}`;
    return this.info(message, { details });
  }

  // Helper to log API errors
  logApiError(url: string, status: number, response?: any) {
    const message = `API Error: ${status} on ${url}`;
    return this.error(message, {
      details: {
        url,
        status,
        response,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

export const clientLogger = new ClientLogger();

// Global error handler for unhandled JavaScript errors
window.addEventListener("error", (event) => {
  clientLogger.logError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

// Global handler for unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  clientLogger.logError(error, {
    type: "unhandled_promise_rejection",
  });
});

// Performance logging
export function logPerformance(name: string, startTime: number) {
  const duration = performance.now() - startTime;
  if (duration > 1000) { // Log slow operations
    clientLogger.warn(`Slow operation: ${name}`, {
      details: { duration: `${duration.toFixed(2)}ms` },
    });
  }
}

// React error boundary helper
export function logReactError(error: Error, errorInfo: any) {
  clientLogger.logError(error, {
    type: "react_error_boundary",
    componentStack: errorInfo.componentStack,
  });
}