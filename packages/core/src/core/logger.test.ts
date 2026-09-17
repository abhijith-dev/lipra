import { describe, expect, it, vi } from 'vitest';

import { Logger } from './logger';
import { createLogRecord } from './record';

describe('createLogRecord', () => {
  it('creates a structured log record with error details', () => {
    const err = new Error('db down');
    const record = createLogRecord({
      level: 'error',
      msg: 'db failed',
      fields: { service: 'api' },
      err,
    });

    expect(record.level).toBe('error');
    expect(record.msg).toBe('db failed');
    expect(record.fields).toEqual({ service: 'api' });
    expect(record.err?.message).toBe('db down');
    expect(record.err?.stack).toContain('Error: db down');
  });
});

describe('Logger', () => {
  it('writes pretty output with scope metadata in TTY mode', () => {
    const originalIsTTY = process.stdout.isTTY;
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true,
    });

    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    const logger = new Logger({ scope: 'auth' });
    logger.info('login ok', { userId: 'abc123' });

    const output = String(writeSpy.mock.calls[0]?.[0]).trim();
    expect(output).toContain('login ok');
    expect(output).toContain('auth');

    writeSpy.mockRestore();
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      configurable: true,
    });
  });

  it('writes JSON output in non-TTY mode', () => {
    const originalIsTTY = process.stdout.isTTY;
    Object.defineProperty(process.stdout, 'isTTY', {
      value: false,
      configurable: true,
    });

    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    const logger = new Logger({ format: 'json' });
    logger.info('server started', { port: 3000 });

    const raw = String(writeSpy.mock.calls[0]?.[0]).trim();
    const parsed = JSON.parse(raw);
    expect(parsed.msg).toBe('server started');
    expect(parsed.fields.port).toBe(3000);

    writeSpy.mockRestore();
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      configurable: true,
    });
  });
});
