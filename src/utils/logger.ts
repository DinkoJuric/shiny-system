/**
 * Structured Logger Logic
 * Wraps console methods to provide consistent formatting, log levels, and potential for remote telemetry.
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

class Logger {
    private level: LogLevel = LogLevel.INFO;
    private seenLogs: Set<string> = new Set();

    constructor() {
        // In development, show everything. In prod, maybe only WARN/ERROR.
        if (import.meta.env.DEV) {
            this.level = LogLevel.DEBUG;
        }
    }

    private format(level: string, message: string, data?: unknown) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }

    debug(message: string, data?: unknown) {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(this.format('DEBUG', message), data || '');
        }
    }

    info(message: string, data?: unknown) {
        if (this.level <= LogLevel.INFO) {
            console.info(this.format('INFO', message), data || '');
        }
    }

    warn(message: string, data?: unknown) {
        if (this.level <= LogLevel.WARN) {
            console.warn(this.format('WARN', message), data || '');
        }
    }

    error(message: string, error?: unknown) {
        if (this.level <= LogLevel.ERROR) {
            console.error(this.format('ERROR', message), error || '');
        }
    }

    once(key: string, level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown) {
        if (this.seenLogs.has(key)) return;
        this.seenLogs.add(key);
        this[level](message, data);
    }
}

export const logger = new Logger();
