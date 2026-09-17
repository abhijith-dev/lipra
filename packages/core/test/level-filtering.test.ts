import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { Logger } from '../src/index';

afterEach(() => {
  jest.restoreAllMocks();
});

describe('level filtering', () => {
  it('suppresses records below the configured level', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const log = new Logger({ level: 'warn', format: 'json' });

    log.trace('a');
    log.debug('b');
    log.info('c');
    log.warn('d');
    log.error('e');
    log.fatal('f');

    expect(write).toHaveBeenCalledTimes(3);
    const messages = write.mock.calls.map((call) => JSON.parse(String(call[0])).msg);
    expect(messages).toEqual(['d', 'e', 'f']);
  });

  it('emits everything by default (info level)', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const log = new Logger({ format: 'json' });

    log.debug('hidden');
    log.info('shown');

    expect(write).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(write.mock.calls[0]?.[0])).msg).toBe('shown');
  });
});
