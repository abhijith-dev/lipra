import { createColors } from 'picocolors';

import type { LogLevel } from '../core/record';

// Force-enabled color functions: our own `shouldUseColor` is the single
// gate for whether to colorize, so picocolors must not double-gate on TTY/env.
const pc = createColors(true);

export const LEVEL_ICONS: Record<LogLevel, string> = {
  trace: '•',
  debug: '•',
  info: 'i',
  warn: '!',
  error: '✖',
  fatal: '✖',
};

export const LEVEL_COLORS: Record<LogLevel, (text: string) => string> = {
  trace: (text) => pc.gray(text),
  debug: (text) => pc.cyan(text),
  info: (text) => pc.green(text),
  warn: (text) => pc.yellow(text),
  error: (text) => pc.red(text),
  fatal: (text) => pc.bold(pc.red(text)),
};

/**
 * Determines whether colored output should be produced for the given stream,
 * respecting the NO_COLOR / FORCE_COLOR conventions.
 */
export function shouldUseColor(stream: NodeJS.WriteStream | undefined = process.stdout): boolean {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(stream?.isTTY);
}

export function colorizeLevel(level: LogLevel, text: string, color: boolean): string {
  return color ? LEVEL_COLORS[level](text) : text;
}
