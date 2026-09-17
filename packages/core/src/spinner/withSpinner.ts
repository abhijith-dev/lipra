import { createSpinner } from './engine';
import type { Logger } from '../core/logger';

/**
 * Runs `task`, showing a terminal spinner while it runs (when stdout is a TTY),
 * and logs the outcome (ok/fail + duration) through the given logger.
 */
export async function withSpinner<T>(logger: Logger, text: string, task: () => Promise<T> | T): Promise<T> {
  const isTTY = Boolean(process.stdout.isTTY);
  const spinner = isTTY ? createSpinner(text) : undefined;
  const start = Date.now();

  try {
    const result = await task();
    const durationMs = Date.now() - start;
    spinner?.succeed(`${text} - ok (${durationMs}ms)`);
    logger.info(`${text} - ok`, { durationMs });
    return result;
  } catch (err) {
    const durationMs = Date.now() - start;
    const error = err instanceof Error ? err : new Error(String(err));
    spinner?.fail(`${text} - fail (${durationMs}ms)`);
    logger.error(error, { text, durationMs });
    throw error;
  }
}
