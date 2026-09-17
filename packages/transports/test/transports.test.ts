import { describe, expect, it, jest } from '@jest/globals';
import { PassThrough } from 'node:stream';

import { ConsoleTransport, StreamTransport, type Transport } from '../src/index';

const record = {
  time: '2026-01-02T03:04:05.000Z',
  level: 'info' as const,
  msg: 'server started',
  fields: { port: 3000 },
};

describe('ConsoleTransport', () => {
  it('writes JSON records to stdout when configured', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const transport: Transport = new ConsoleTransport({ format: 'json' });

    transport.write(record);

    expect(write).toHaveBeenCalledWith(`${JSON.stringify(record)}\n`);
    write.mockRestore();
  });

  it('writes pretty records to stdout when configured', () => {
    const write = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

    new ConsoleTransport({ format: 'pretty' }).write(record);

    expect(String(write.mock.calls[0]?.[0])).toContain('INFO server started {"port":3000}');
    write.mockRestore();
  });
});

describe('StreamTransport', () => {
  it('writes JSON lines to a writable stream by default', () => {
    const stream = new PassThrough();
    let output = '';
    stream.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });

    new StreamTransport(stream).write(record);

    expect(output).toBe(`${JSON.stringify(record)}\n`);
  });

  it('writes pretty output when configured', () => {
    const stream = new PassThrough();
    let output = '';
    stream.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });

    new StreamTransport(stream, { format: 'pretty' }).write(record);

    expect(output).toContain('INFO server started {"port":3000}');
  });
});