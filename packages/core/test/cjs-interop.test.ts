import { describe, expect, it } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

describe('CommonJS interop', () => {
  it('requires lipra from a plain .cjs file', () => {
    const output = execFileSync('node', [path.join(__dirname, 'fixtures', 'require-lipra.cjs')], {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8',
    });

    expect(output.trim()).toBe('OK');
  });
});
