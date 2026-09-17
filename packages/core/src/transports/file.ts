import { appendFileSync } from 'node:fs';

import type { LogRecord } from '../core/record';
import { jsonFormat } from '../formatters/json';
import { passesMinLevel, type Transport, type TransportOptions } from './transport';

export interface FileTransportOptions extends TransportOptions {
  path: string;
}

/** Appends newline-delimited JSON records to a file. */
export class FileTransport implements Transport {
  constructor(private readonly options: FileTransportOptions) {}

  write(record: LogRecord): void {
    if (!passesMinLevel(record, this.options.minLevel)) return;
    appendFileSync(this.options.path, `${jsonFormat(record)}\n`);
  }
}
