import { createLogRecord, type LogLevel, type LogRecord } from './record';

export type LoggerFormat = 'pretty' | 'json' | 'auto';

export interface LoggerOptions {
  level?: LogLevel;
  format?: LoggerFormat;
  scope?: string;
}

export class Logger {
  private readonly level: LogLevel;
  private readonly format: LoggerFormat;
  private readonly scope?: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 'info';
    this.format = options.format ?? 'auto';
    this.scope = options.scope;
  }

  child(bindings: Record<string, unknown>): Logger {
    const scope = this.scope ? `${this.scope}:${String(bindings.module ?? 'child')}` : String(bindings.module ?? 'child');
    return new Logger({
      level: this.level,
      format: this.format,
      scope,
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
    const record = createLogRecord({
      level,
      msg,
      fields,
      err,
      scope: this.scope,
    });

    this.emit(record);
  }

  private emit(record: LogRecord) {
    const output = this.format === 'json' || (this.format === 'auto' && !process.stdout.isTTY)
      ? JSON.stringify(record)
      : prettyFormat(record);

    process.stdout.write(`${output}\n`);
  }
}

export const logger = new Logger();

function prettyFormat(record: LogRecord): string {
  const level = record.level.toUpperCase();
  const time = new Date(record.time).toLocaleTimeString();
  const scope = record.scope ? ` [${record.scope}]` : '';
  const fields = record.fields && Object.keys(record.fields).length > 0 ? ` ${JSON.stringify(record.fields)}` : '';
  const err = record.err ? ` ${JSON.stringify(record.err)}` : '';
  return `${time} ${level}${scope} ${record.msg}${fields}${err}`;
}
