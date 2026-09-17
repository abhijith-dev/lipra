import type { Logger } from './logger';

export function redactValue<T>(value: T, paths: string[]): T {
  if (!paths.length) return value;

  const clone = structuredClone(value);

  for (const path of paths) {
    const segments = path.split('.').filter(Boolean);
    if (segments.length === 0) continue;
    redactPath(clone, segments);
  }

  return clone;
}

function redactPath(target: unknown, segments: string[]): void {
  if (target === null || typeof target !== 'object') return;

  const [head, ...rest] = segments;
  const obj = target as Record<string, unknown>;

  if (head === '*') {
    for (const key of Object.keys(obj)) {
      applySegment(obj, key, rest);
    }
    return;
  }

  applySegment(obj, head, rest);
}

function applySegment(obj: Record<string, unknown>, key: string, rest: string[]): void {
  if (!(key in obj)) return;

  if (rest.length === 0) {
    obj[key] = '[REDACTED]';
    return;
  }

  redactPath(obj[key], rest);
}

const LOG_METHODS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;

/**
 * Wraps a logger so any `fields` argument is auto-redacted at the given paths
 * before it reaches the underlying logger (including on `child()` loggers).
 */
export function redactFields(logger: Logger, paths: string[]): Logger {
  return new Proxy(logger, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (typeof value !== 'function') return value;

      if (typeof prop === 'string' && (LOG_METHODS as readonly string[]).includes(prop)) {
        return (msg: unknown, fields?: Record<string, unknown>) => {
          const redacted = fields ? redactValue(fields, paths) : fields;
          return (value as (...args: unknown[]) => unknown).call(target, msg, redacted);
        };
      }

      if (prop === 'child') {
        return (...args: unknown[]) => {
          const child = (value as (...args: unknown[]) => Logger).apply(target, args);
          return redactFields(child, paths);
        };
      }

      return value.bind(target);
    },
  });
}
