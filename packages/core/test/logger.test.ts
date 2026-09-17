import { describe, expect, it, jest } from '@jest/globals';

import { Logger } from '../src/index';

describe('Logger', () => {
  it('emits JSON records and respects the configured scope', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const logger = new Logger({ format: 'json', scope: 'auth' });

    logger.info('login succeeded', { userId: 'user-123' });

    const output = String(write.mock.calls[0]?.[0]).trim();
    expect(JSON.parse(output)).toMatchObject({
      level: 'info',
      msg: 'login succeeded',
      fields: { userId: 'user-123' },
      scope: 'auth',
    });
    write.mockRestore();
  });

  it('serializes Error messages and child scopes', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const logger = new Logger({ format: 'json', scope: 'api' }).child({ module: 'database' });

    logger.error(new Error('connection lost'), { retryable: true });

    expect(JSON.parse(String(write.mock.calls[0]?.[0]))).toMatchObject({
      level: 'error',
      msg: 'connection lost',
      fields: { retryable: true },
      scope: 'api:database',
      err: { message: 'connection lost' },
    });
    write.mockRestore();
  });

  it('uses pretty formatting when explicitly requested', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    new Logger({ format: 'pretty' }).warn('cache warming');

    expect(String(write.mock.calls[0]?.[0])).toContain('WARN cache warming');
    write.mockRestore();
  });
});