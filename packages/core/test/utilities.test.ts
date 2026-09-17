import { describe, expect, it, jest } from '@jest/globals';

import {
  ConsoleTransport,
  Logger,
  getContext,
  jsonFormat,
  prettyFormat,
  redactFields,
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

  it('redacts array indices and wildcard segments', () => {
    const input = {
      users: [
        { name: 'a', password: 'pw-a' },
        { name: 'b', password: 'pw-b' },
      ],
    };

    expect(redactValue(input, ['users.0.password'])).toEqual({
      users: [
        { name: 'a', password: '[REDACTED]' },
        { name: 'b', password: 'pw-b' },
      ],
    });

    expect(redactValue(input, ['users.*.password'])).toEqual({
      users: [
        { name: 'a', password: '[REDACTED]' },
        { name: 'b', password: '[REDACTED]' },
      ],
    });
  });

  it('redactFields wraps a logger to auto-redact fields on every call', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const base = new Logger({ format: 'json' });
    const safe = redactFields(base, ['password']);

    safe.info('login attempt', { user: 'abc', password: 'secret' });

    const parsed = JSON.parse(String(write.mock.calls[0]?.[0]));
    expect(parsed.fields).toEqual({ user: 'abc', password: '[REDACTED]' });

    const child = safe.child({ module: 'auth' });
    child.warn('retrying', { password: 'still-secret' });
    const childParsed = JSON.parse(String(write.mock.calls[1]?.[0]));
    expect(childParsed.fields.password).toBe('[REDACTED]');
    expect(childParsed.scope).toBe('auth');

    write.mockRestore();
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