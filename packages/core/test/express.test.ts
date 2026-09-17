import { describe, expect, it, jest } from '@jest/globals';
import { EventEmitter } from 'node:events';

import { Logger } from '../src/index';
import { expressLogger } from '../src/integrations/express';

function createReqRes(overrides: Partial<{ headers: Record<string, string> }> = {}) {
  const res = Object.assign(new EventEmitter(), {
    statusCode: 200,
    setHeader: jest.fn(),
  });
  const req = { method: 'GET', path: '/health', headers: overrides.headers ?? {} };
  return { req, res };
}

describe('expressLogger', () => {
  it('logs request start/finish with method/path/status/duration', () => {
    const calls: Array<[string, Record<string, unknown> | undefined]> = [];
    const logger = new Logger({ transports: [{ write: () => undefined }] });
    jest.spyOn(logger, 'info').mockImplementation((msg: string, fields?: Record<string, unknown>) => {
      calls.push([msg, fields]);
    });

    const middleware = expressLogger(logger);
    const { req, res } = createReqRes();
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(calls[0][0]).toBe('request start');
    expect(calls[0][1]).toMatchObject({ method: 'GET', path: '/health' });

    res.emit('finish');
    expect(calls[1][0]).toBe('request finish');
    expect(calls[1][1]).toMatchObject({ method: 'GET', path: '/health', status: 200 });
  });

  it('reuses an incoming x-request-id header', () => {
    const logger = new Logger({ transports: [{ write: () => undefined }] });
    const infoSpy = jest.spyOn(logger, 'info');

    const middleware = expressLogger(logger);
    const { req, res } = createReqRes({ headers: { 'x-request-id': 'req-abc' } });

    middleware(req, res, jest.fn());

    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'req-abc');
    expect(infoSpy.mock.calls[0][1]).toMatchObject({ requestId: 'req-abc' });
  });
});
