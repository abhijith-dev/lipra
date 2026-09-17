import { jsonFormat, prettyFormat, type LogRecord } from 'lipra';

import type { Transport, TransportFormat } from './transport';

export interface ConsoleTransportOptions {
  format?: TransportFormat;
}

export class ConsoleTransport implements Transport {
  constructor(private readonly options: ConsoleTransportOptions = {}) {}

  write(record: LogRecord): void {
    const format = this.options.format ?? (process.stdout.isTTY ? 'pretty' : 'json');
    const output = format === 'json' ? jsonFormat(record) : prettyFormat(record);
    process.stdout.write(`${output}\n`);
  }
}