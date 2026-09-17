import { describe, expect, it } from '@jest/globals';

import { createLogRecord, serializeError } from '../src/index';

describe('log records', () => {
  it('creates a record with optional metadata and serialized errors', () => {
    const error = new Error('database unavailable');
    const record = createLogRecord({
      level: 'error',
      msg: 'request failed',
      fields: { requestId: 'req-123' },
      err: error,
      scope: 'api',
    });

    expect(record).toMatchObject({
      level: 'error',
      msg: 'request failed',
      fields: { requestId: 'req-123' },
      scope: 'api',
      err: { message: 'database unavailable' },
    });
    expect(record.time).toEqual(expect.any(String));
    expect(new Date(record.time).toISOString()).toBe(record.time);
  });

  it('serializes supported error values without throwing', () => {
    expect(serializeError('failed')).toEqual({ message: 'failed' });
    expect(serializeError({ code: 'E_CONN' })).toEqual({
      message: '[object Object]',
      code: 'E_CONN',
    });
    expect(serializeError(null)).toEqual({ message: 'null' });
    expect(serializeError(404)).toEqual({ message: '404' });
  });

  it('preserves the error name and cause in serialization', () => {
    const error = new Error('timeout', { cause: 'upstream' });

    expect(serializeError(error)).toMatchObject({
      name: 'Error',
      message: 'timeout',
      cause: 'upstream',
    });
  });
});