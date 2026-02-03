// lib/monitoring.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}

const logs: LogEntry[] = [];
const MAX_LOGS = 500;

function addLog(level: LogLevel, message: string, context?: Record<string, any>) {
  logs.unshift({
    level,
    message,
    timestamp: Date.now(),
    context,
  });

  if (logs.length > MAX_LOGS) {
    logs.pop();
  }

  // 開発中はコンソールにも出す
  const isProd =
  typeof process !== 'undefined' &&
  process?.env?.NODE_ENV === 'production';

if (!isProd) {
    const fn =
      level === 'error'
        ? console.error
        : level === 'warn'
        ? console.warn
        : console.log;
    fn(`[${level}] ${message}`, context ?? '');
  }
}

export const logger = {
  info: (message: string, context?: Record<string, any>) =>
    addLog('info', message, context),
  warn: (message: string, context?: Record<string, any>) =>
    addLog('warn', message, context),
  error: (message: string, context?: Record<string, any>) =>
    addLog('error', message, context),
  debug: (message: string, context?: Record<string, any>) =>
    addLog('debug', message, context),
};

export const tracker = {
  event: (name: string, payload?: Record<string, any>) => {
    addLog('info', `event:${name}`, payload);
  },
};

export function getLogs() {
  return logs;
}