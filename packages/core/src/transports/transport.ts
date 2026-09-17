import { LEVEL_WEIGHT, type LogLevel, type LogRecord } from '../core/record';

export interface Transport {
  write(record: LogRecord): void;
}

export interface TransportOptions {
  /** Independent minimum level filter, applied in addition to the logger's own level. */
  minLevel?: LogLevel;
}

export function passesMinLevel(record: LogRecord, minLevel?: LogLevel): boolean {
  if (!minLevel) return true;
  return LEVEL_WEIGHT[record.level] >= LEVEL_WEIGHT[minLevel];
}
