import { describe, expect, it } from '@jest/globals';

import { prettyFormat, shouldUseColor } from '../src/index';

const record = {
  time: '2026-01-02T03:04:05.000Z',
  level: 'error' as const,
  msg: 'boom',
};

describe('color output', () => {
  it('does not colorize when color is disabled', () => {
    expect(prettyFormat(record, { color: false })).not.toContain('\u001b[');
  });

  it('colorizes the level when color is enabled', () => {
    expect(prettyFormat(record, { color: true })).toContain('\u001b[');
  });

  it('disables color when stdout is not a TTY', () => {
    const stream = { isTTY: false } as NodeJS.WriteStream;
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    expect(shouldUseColor(stream)).toBe(false);
  });

  it('respects NO_COLOR even on a TTY', () => {
    const stream = { isTTY: true } as NodeJS.WriteStream;
    process.env.NO_COLOR = '1';
    expect(shouldUseColor(stream)).toBe(false);
    delete process.env.NO_COLOR;
  });

  it('respects FORCE_COLOR even off a TTY', () => {
    const stream = { isTTY: false } as NodeJS.WriteStream;
    process.env.FORCE_COLOR = '1';
    expect(shouldUseColor(stream)).toBe(true);
    delete process.env.FORCE_COLOR;
  });
});
