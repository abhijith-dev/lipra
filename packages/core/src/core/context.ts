import { AsyncLocalStorage } from 'node:async_hooks';

const storage = new AsyncLocalStorage<Record<string, unknown>>();

export function runWithContext<T>(context: Record<string, unknown>, fn: () => T): T {
  return storage.run(context, fn);
}

export function getContext(): Record<string, unknown> {
  return storage.getStore() ?? {};
}

/** @deprecated Use `runWithContext` instead. Kept only for backward compatibility. */
export function withContext<T>(context: Record<string, unknown>, fn: () => T): T {
  return runWithContext(context, fn);
}
