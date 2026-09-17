import type { LogRecord } from '../core/record';

export function jsonFormat(record: LogRecord): string {
  return JSON.stringify(record);
}
