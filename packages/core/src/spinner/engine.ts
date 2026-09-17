export interface SpinnerHandle {
  succeed(message?: string): void;
  fail(message?: string): void;
  warn(message?: string): void;
  stop(): void;
}

export function createSpinner(_message: string): SpinnerHandle {
  return {
    succeed(message) {
      if (message) process.stdout.write(`${message}\n`);
    },
    fail(message) {
      if (message) process.stdout.write(`${message}\n`);
    },
    warn(message) {
      if (message) process.stdout.write(`${message}\n`);
    },
    stop() {
      // no-op in v0.1; stub to satisfy API contract
    },
  };
}
