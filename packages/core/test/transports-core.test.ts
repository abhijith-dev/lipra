import { describe, expect, it, jest } from '@jest/globals';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { ConsoleTransport, FileTransport, Logger, StreamTransport, type Transport } from '../src/index';

const record = {
  time: '2026-01-02T03:04:05.000Z',
  level: 'info' as const,
  msg: 'server started',
  fields: { port: 3000 },
};

describe('transport fan-out', () => {
  it('dispatches each emitted record to every configured transport', () => {
    const calls: unknown[][] = [];
    const fake: Transport = { write: (rec) => calls.push([rec]) };
    const fake2: Transport = { write: (rec) => calls.push([rec]) };

    const log = new Logger({ transports: [fake, fake2] });
    log.info('hello');

    expect(calls).toHaveLength(2);
  });

  it('writes to console and file transports from a single logger', () => {
    const filePath = join(tmpdir(), `lipra-test-${Date.now()}.log`);
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    const log = new Logger({
      format: 'json',
      transports: [new ConsoleTransport({ format: 'json' }), new FileTransport({ path: filePath })],
    });

    log.info('to both sinks', { ok: true });

    expect(write).toHaveBeenCalled();
    const fileContents = readFileSync(filePath, 'utf8').trim();
    expect(JSON.parse(fileContents)).toMatchObject({ msg: 'to both sinks', fields: { ok: true } });

    write.mockRestore();
    rmSync(filePath);
  });
});

describe('FileTransport', () => {
  it('respects an independent minLevel filter', () => {
    const filePath = join(tmpdir(), `lipra-test-minlevel-${Date.now()}.log`);
    const transport = new FileTransport({ path: filePath, minLevel: 'error' });

    transport.write({ ...record, level: 'info' });
    transport.write({ ...record, level: 'error', msg: 'boom' });

    const lines = readFileSync(filePath, 'utf8').trim().split('\n');
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]).msg).toBe('boom');

    rmSync(filePath);
  });
});

describe('StreamTransport', () => {
  it('respects an independent minLevel filter', () => {
    let output = '';
    const stream = { write: (chunk: string) => { output += chunk; return true; } } as unknown as NodeJS.WritableStream as any;
    const transport = new StreamTransport(stream, { minLevel: 'warn' });

    transport.write({ ...record, level: 'debug' });
    transport.write({ ...record, level: 'warn', msg: 'careful' });

    expect(output.trim()).toBe(JSON.stringify({ ...record, level: 'warn', msg: 'careful' }));
  });
});
