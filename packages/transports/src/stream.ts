import type { Writable } from 'node:stream';

import { jsonFormat, prettyFormat, type LogRecord } from 'lipra';

import type { Transport, TransportFormat } from './transport';

export interface StreamTransportOptions {
  format?: Exclude<TransportFormat, 'auto'>;
}

export class StreamTransport implements Transport {
  constructor(
    private readonly stream: Writable,
    private readonly options: StreamTransportOptions = {},
  ) {}

  write(record: LogRecord): void {
    const output = this.options.format === 'pretty' ? prettyFormat(record) : jsonFormat(record);
    this.stream.write(`${output}\n`);
  }
}