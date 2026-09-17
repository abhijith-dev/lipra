import { colorizeLevel } from '../color/theme';
import type { LogRecord } from '../core/record';

export interface PrettyFormatOptions {
  color?: boolean;
}

export function prettyFormat(record: LogRecord, options: PrettyFormatOptions = {}): string {
  const level = colorizeLevel(record.level, record.level.toUpperCase(), Boolean(options.color));
  const time = new Date(record.time).toLocaleTimeString();
  const scope = record.scope ? ` [${record.scope}]` : '';
  const fields = record.fields && Object.keys(record.fields).length > 0 ? ` ${JSON.stringify(record.fields)}` : '';
  const err = record.err ? ` ${JSON.stringify(record.err)}` : '';
  return `${time} ${level}${scope} ${record.msg}${fields}${err}`;
}
