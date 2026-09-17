import type { Writable } from 'node:stream';

import type { LogRecord } from '../core/record';
import { jsonFormat } from '../formatters/json';
import { prettyFormat } from '../formatters/pretty';
import { passesMinLevel, type Transport, type TransportOptions } from './transport';

export interface StreamTransportOptions extends TransportOptions {
  format?: 'pretty' | 'json';
}

/** Writes log records to any writable stream, JSON Lines by default. */
export class StreamTransport implements Transport {
  constructor(
    private readonly stream: Writable,
    private readonly options: StreamTransportOptions = {},
  ) {}

  write(record: LogRecord): void {
    if (!passesMinLevel(record, this.options.minLevel)) return;
    const output = this.options.format === 'pretty' ? prettyFormat(record) : jsonFormat(record);
    this.stream.write(`${output}\n`);
  }
}
