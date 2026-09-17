import { createLogRecord, LEVEL_WEIGHT, type LogLevel, type LogRecord } from './record';
import { ConsoleTransport } from '../transports/console';
import type { Transport } from '../transports/transport';

export type LoggerFormat = 'pretty' | 'json' | 'auto';

export interface LoggerOptions {
  level?: LogLevel;
  format?: LoggerFormat;
  scope?: string;
  fields?: Record<string, unknown>;
  transports?: Transport[];
}

export interface ChildLoggerOptions {
  level?: LogLevel;
  format?: LoggerFormat;
  transports?: Transport[];
}

export class Logger {
  private readonly level: LogLevel;
  private readonly format: LoggerFormat;
  private readonly scope?: string;
  private readonly fields: Record<string, unknown>;
  private readonly transports: Transport[];

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 'info';
    this.format = options.format ?? 'auto';
    this.scope = options.scope;
    this.fields = options.fields ?? {};
    this.transports = options.transports ?? [new ConsoleTransport({ format: this.format })];
  }

  child(bindings: Record<string, unknown>, overrides: ChildLoggerOptions = {}): Logger {
    const scope = this.scope ? `${this.scope}:${String(bindings.module ?? 'child')}` : String(bindings.module ?? 'child');
    return new Logger({
      level: overrides.level ?? this.level,
      format: overrides.format ?? this.format,
      transports: overrides.transports ?? this.transports,
      scope,
      fields: { ...this.fields, ...bindings },
    });
  }

  trace(msg: string, fields?: Record<string, unknown>) {
    this.write('trace', msg, fields);
  }

  debug(msg: string, fields?: Record<string, unknown>) {
    this.write('debug', msg, fields);
  }

  info(msg: string, fields?: Record<string, unknown>) {
    this.write('info', msg, fields);
  }

  warn(msg: string, fields?: Record<string, unknown>) {
    this.write('warn', msg, fields);
  }

  error(msg: string | Error, fields?: Record<string, unknown>) {
    if (msg instanceof Error) {
      this.write('error', msg.message, fields, msg);
      return;
    }

    this.write('error', msg, fields);
  }

  fatal(msg: string, fields?: Record<string, unknown>) {
    this.write('fatal', msg, fields);
  }

  private write(level: LogLevel, msg: string, fields?: Record<string, unknown>, err?: unknown) {
    if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[this.level]) return;

    const mergedFields = Object.keys(this.fields).length > 0 || fields
      ? { ...this.fields, ...fields }
      : undefined;

    const record = createLogRecord({
      level,
      msg,
      fields: mergedFields,
      err,
      scope: this.scope,
    });

    this.emit(record);
  }

  private emit(record: LogRecord) {
    for (const transport of this.transports) {
      transport.write(record);
    }
  }
}

export const logger = new Logger();

