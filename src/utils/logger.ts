export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    message: string;
    data?: any;
}

class Logger {
    private logs: LogEntry[] = [];
    private maxLogs = 100;
    private seenEvents = new Set<string>(); // Track events we've seen

    private addLog(level: LogLevel, message: string, data?: any) {
        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            message,
            data
        };
        this.logs.unshift(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }

        // Console output with styling
        const style = this.getStyle(level);
        console.log(`%c[${level.toUpperCase()}] ${message}`, style, data || '');
    }

    info(message: string, data?: any) { this.addLog('info', message, data); }
    warn(message: string, data?: any) { this.addLog('warn', message, data); }
    error(message: string, data?: any) { this.addLog('error', message, data); }
    debug(message: string, data?: any) { this.addLog('debug', message, data); }

    // Log only once per unique event key
    once(key: string, level: LogLevel, message: string, data?: any) {
        if (this.seenEvents.has(key)) return;
        this.seenEvents.add(key);
        this.addLog(level, message, data);
    }

    getLogs() { return this.logs; }
    clear() { this.logs = []; this.seenEvents.clear(); }

    private getStyle(level: LogLevel) {
        switch (level) {
            case 'info': return 'color: #3b82f6';
            case 'warn': return 'color: #f59e0b';
            case 'error': return 'color: #ef4444; font-weight: bold';
            case 'debug': return 'color: #9ca3af';
        }
    }
}

export const logger = new Logger();

