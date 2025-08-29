import { db } from "./db";
import { logs, type InsertLog } from "@shared/schema";
import { nanoid } from "nanoid";

export type LogLevel = "info" | "warn" | "error" | "debug";
export type LogSource = "server" | "client";

interface LogContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  details?: Record<string, any>;
  stackTrace?: string;
}

class Logger {
  private requestId?: string;

  constructor(requestId?: string) {
    this.requestId = requestId || nanoid(10);
  }

  private async writeLog(level: LogLevel, source: LogSource, message: string, context?: LogContext) {
    try {
      const logData: InsertLog = {
        level,
        source,
        message,
        details: context?.details ? JSON.stringify(context.details) : null,
        userId: context?.userId || null,
        requestId: context?.requestId || this.requestId,
        userAgent: context?.userAgent || null,
        ipAddress: context?.ipAddress || null,
        stackTrace: context?.stackTrace || null,
      };

      await db.insert(logs).values(logData);
      
      // Also log to console for development
      console.log(`[${new Date().toISOString()}] [${source.toUpperCase()}] [${level.toUpperCase()}] ${message}`, 
        context?.details ? JSON.stringify(context.details, null, 2) : '');
      
    } catch (error) {
      // Fallback to console if database logging fails
      console.error('Failed to write to database log:', error);
      console.log(`[${new Date().toISOString()}] [${source.toUpperCase()}] [${level.toUpperCase()}] ${message}`);
    }
  }

  // Server logging methods
  info(message: string, context?: LogContext) {
    return this.writeLog("info", "server", message, context);
  }

  warn(message: string, context?: LogContext) {
    return this.writeLog("warn", "server", message, context);
  }

  error(message: string, context?: LogContext) {
    return this.writeLog("error", "server", message, context);
  }

  debug(message: string, context?: LogContext) {
    return this.writeLog("debug", "server", message, context);
  }

  // Client logging method (called from API endpoint)
  clientLog(level: LogLevel, message: string, context?: LogContext) {
    return this.writeLog(level, "client", message, context);
  }

  // Request logging utility
  logRequest(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    const message = `${method} ${path} ${statusCode} in ${duration}ms`;
    return this.writeLog(level, "server", message, context);
  }

  // Error logging utility
  logError(error: Error, context?: LogContext) {
    const message = `Error: ${error.message}`;
    const errorContext = {
      ...context,
      details: {
        ...context?.details,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      },
      stackTrace: error.stack
    };
    return this.writeLog("error", "server", message, errorContext);
  }
}

// Create a default logger instance
export const logger = new Logger();

// Factory function for request-specific loggers
export function createRequestLogger(requestId: string) {
  return new Logger(requestId);
}

// Utility to extract request info
export function getRequestInfo(req: any) {
  return {
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip || req.connection.remoteAddress,
    userId: req.session?.user?.id,
  };
}