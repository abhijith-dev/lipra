export function redactValue<T>(value: T, paths: string[]): T {
  if (!paths.length) return value;

  const clone = structuredClone(value);

  for (const path of paths) {
    const segments = path.split('.').filter(Boolean);
    if (segments.length === 0) continue;
    let current: any = clone;

    for (let i = 0; i < segments.length - 1; i += 1) {
      if (!current || typeof current !== 'object' || !(segments[i] in current)) {
        current = undefined;
        break;
      }
      current = current[segments[i]];
    }

    if (!current || typeof current !== 'object') continue;
    current[segments[segments.length - 1]] = '[REDACTED]';
  }

  return clone;
}
