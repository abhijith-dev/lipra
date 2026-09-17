import { describe, expect, it, jest } from '@jest/globals';

import {
  ConsoleTransport,
  getContext,
  jsonFormat,
  prettyFormat,
  redactValue,
  runWithContext,
  withContext,
} from '../src/index';

const record = {
  time: '2026-01-02T03:04:05.000Z',
  level: 'info' as const,
  msg: 'server started',
  fields: { port: 3000 },
  scope: 'api',
};

describe('context and redaction', () => {
  it('makes context available only inside its callback', () => {
    expect(getContext()).toEqual({});

    runWithContext({ requestId: 'req-123' }, () => {
      expect(getContext()).toEqual({ requestId: 'req-123' });
    });

    withContext({ userId: 'user-456' }, () => {
      expect(getContext()).toEqual({ userId: 'user-456' });
    });
    expect(getContext()).toEqual({});
  });

  it('redacts requested nested paths without mutating the input', () => {
    const input = { credentials: { password: 'secret' }, token: 'token-value' };
    const redacted = redactValue(input, ['credentials.password', 'token', 'missing.path']);

    expect(redacted).toEqual({
      credentials: { password: '[REDACTED]' },
      token: '[REDACTED]',
    });
    expect(input.credentials.password).toBe('secret');
    expect(input.token).toBe('token-value');
  });
});

describe('formatters and transport', () => {
  it('formats JSON and pretty output with all available record fields', () => {
    expect(jsonFormat(record)).toBe(JSON.stringify(record));
    expect(prettyFormat(record)).toContain('INFO [api] server started {"port":3000}');
  });

  it('writes the requested JSON format to stdout', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    new ConsoleTransport({ format: 'json' }).write(record);

    expect(write).toHaveBeenCalledWith(`${JSON.stringify(record)}\n`);
    write.mockRestore();
  });
});