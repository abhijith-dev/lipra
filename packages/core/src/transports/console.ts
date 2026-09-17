import { shouldUseColor } from '../color/theme';
import type { LogRecord } from '../core/record';
import { jsonFormat } from '../formatters/json';
import { prettyFormat } from '../formatters/pretty';
import { passesMinLevel, type Transport, type TransportOptions } from './transport';

export interface ConsoleTransportOptions extends TransportOptions {
  format?: 'pretty' | 'json' | 'auto';
}

export class ConsoleTransport implements Transport {
  constructor(private readonly options: ConsoleTransportOptions = {}) {}

  write(record: LogRecord): void {
    if (!passesMinLevel(record, this.options.minLevel)) return;

    const format = this.options.format ?? (process.stdout.isTTY ? 'pretty' : 'json');
    const output = format === 'json' ? jsonFormat(record) : prettyFormat(record, { color: shouldUseColor(process.stdout) });
    process.stdout.write(`${output}\n`);
  }
}
