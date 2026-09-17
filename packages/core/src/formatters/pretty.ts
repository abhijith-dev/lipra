import type { LogRecord } from '../core/record';

export function prettyFormat(record: LogRecord): string {
  const level = record.level.toUpperCase();
  const time = new Date(record.time).toLocaleTimeString();
  const scope = record.scope ? ` [${record.scope}]` : '';
  const fields = record.fields && Object.keys(record.fields).length > 0 ? ` ${JSON.stringify(record.fields)}` : '';
  const err = record.err ? ` ${JSON.stringify(record.err)}` : '';
  return `${time} ${level}${scope} ${record.msg}${fields}${err}`;
}
