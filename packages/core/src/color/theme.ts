export const LEVEL_ICONS: Record<string, string> = {
  trace: '•',
  debug: '•',
  info: 'i',
  warn: '!',
  error: '✖',
  fatal: '✖',
};

export const LEVEL_COLORS: Record<string, (text: string) => string> = {
  trace: (text) => text,
  debug: (text) => text,
  info: (text) => text,
  warn: (text) => text,
  error: (text) => text,
  fatal: (text) => text,
};
