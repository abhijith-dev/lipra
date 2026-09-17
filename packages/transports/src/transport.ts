import type { LogRecord } from 'lipra';

export type TransportFormat = 'pretty' | 'json' | 'auto';

export interface Transport {
  write(record: LogRecord): void;
}