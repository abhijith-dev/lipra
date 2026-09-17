import type { LogRecord } from '../core/record';
import { jsonFormat } from '../formatters/json';
import { prettyFormat } from '../formatters/pretty';

export interface ConsoleTransportOptions {
  format?: 'pretty' | 'json' | 'auto';
}

export class ConsoleTransport {
  constructor(private readonly options: ConsoleTransportOptions = {}) {}

  write(record: LogRecord): void {
    const format = this.options.format ?? (process.stdout.isTTY ? 'pretty' : 'json');
    const output = format === 'json' ? jsonFormat(record) : prettyFormat(record);
    process.stdout.write(`${output}\n`);
  }
}
