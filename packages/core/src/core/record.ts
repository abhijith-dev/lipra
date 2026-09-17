export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const LEVEL_WEIGHT: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

export interface LogErrorRecord {
  name?: string;
  message: string;
  stack?: string;
  cause?: unknown;
}

export interface LogRecord {
  time: string;
  level: LogLevel;
  msg: string;
  fields?: Record<string, unknown>;
  err?: LogErrorRecord;
  scope?: string;
}

export interface LogRecordInput {
  level: LogLevel;
  msg: string;
  fields?: Record<string, unknown>;
  err?: unknown;
  scope?: string;
}

export function createLogRecord(input: LogRecordInput): LogRecord {
  const record: LogRecord = {
    time: new Date().toISOString(),
    level: input.level,
    msg: input.msg,
    ...(input.fields ? { fields: input.fields } : {}),
    ...(input.scope ? { scope: input.scope } : {}),
  };

  if (input.err) {
    record.err = serializeError(input.err);
  }

  return record;
}

export function serializeError(err: unknown): LogErrorRecord {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause,
    };
  }

  if (typeof err === 'string') {
    return { message: err };
  }

  if (err && typeof err === 'object') {
    return {
      message: Object.prototype.toString.call(err),
      ...(err as Record<string, unknown>),
    } as LogErrorRecord;
  }

  return { message: String(err) };
}
