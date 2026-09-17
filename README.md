# lipra

A small, structured logger for Node.js services and CLIs. `lipra` produces readable terminal output during local development and JSON records in non-interactive environments.

## Features

- leveled logging: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- pretty console output in TTY terminals
- JSON output when stdout is not a TTY
- child loggers with a `scope`
- structured error serialization
- async context helpers
- redaction helpers
- optional console and writable-stream transports
- package-ready ESM/CJS builds

## Installation

```bash
npm install lipra
# or
pnpm add lipra
# or
yarn add lipra
```

For standalone transports:

```bash
npm install lipra lipra-transports
```

`lipra-transports` requires `lipra` and is useful when you create or forward `LogRecord` values yourself. The built-in `Logger` writes directly to stdout.

## Quick start

```ts
import { logger } from 'lipra';

logger.info('Server starting', { port: 3000 });
logger.warn('Cache miss', { key: 'user:42' });
logger.error('Database failed', { service: 'api', tenant: 'acme' });
```

In a TTY, the default `auto` format produces output similar to:

```txt
16:20:34 INFO [auth] User login ok {"userId":"abc123"}
```

When stdout is not a TTY, `auto` produces one JSON record per line:

```json
{"time":"2026-09-16T16:20:34.123Z","level":"info","msg":"Server starting","fields":{"port":3000}}
```

## Core API

### Default logger

```ts
import { logger } from 'lipra';
```

### Methods

```ts
logger.trace('trace message', { foo: 'bar' });
logger.debug('debug message', { step: 2 });
logger.info('info message', { env: 'dev' });
logger.warn('warning message', { retry: true });
logger.error('request failed', { route: '/api/users' });
logger.error(new Error('db down'));
logger.fatal('process crashed', { exitCode: 1 });
```

All methods accept a message and optional structured fields. `error` also accepts an `Error`; its message, stack, and cause are serialized into the log record.

### Child logger

```ts
import { logger } from 'lipra';

const authLogger = logger.child({ module: 'auth' });
authLogger.info('User login ok', { userId: 'abc123' });
```

### Custom logger instance

```ts
import { Logger } from 'lipra';

const appLogger = new Logger({
  level: 'debug',
  format: 'pretty',
  scope: 'api'
});

appLogger.info('Boot complete', { port: 3000 });
```

`child` creates a new logger with a nested scope. The `module` binding becomes the final scope segment.

```ts
const databaseLogger = appLogger.child({ module: 'database' });
databaseLogger.info('Connection established');
// ... [api:database] Connection established
```

## Configuration

The logger supports a few configuration knobs through the `LoggerOptions` object.

```ts
import { Logger } from 'lipra';

const appLogger = new Logger({
  format: 'auto', // 'pretty' | 'json' | 'auto'
  scope: 'service-a'
});
```

### Format behavior

- `pretty`: always writes pretty output
- `json`: always writes JSON output
- `auto`: uses pretty for TTY, JSON for non-TTY

`LoggerOptions` also accepts `level` (`trace`, `debug`, `info`, `warn`, `error`, or `fatal`) for API compatibility. Log-level filtering is not currently applied by `Logger`; callers that need filtering should decide whether to call a logging method.

## Optional Transports

The `lipra-transports` package writes `LogRecord` values to stdout or any Node.js writable stream. It is independent of the built-in `Logger` output path, so use it when a service has its own record-processing or forwarding flow.

```ts
import { ConsoleTransport, StreamTransport } from 'lipra-transports';
import type { LogRecord } from 'lipra';

const record: LogRecord = {
  time: new Date().toISOString(),
  level: 'info',
  msg: 'Server started',
  fields: { port: 3000 },
};

new ConsoleTransport({ format: 'auto' }).write(record);
new StreamTransport(process.stdout).write(record);
```

`ConsoleTransport` supports `pretty`, `json`, and `auto` formats. `StreamTransport` writes JSON Lines by default and supports `pretty` output when configured.

Both classes implement the `Transport` interface:

```ts
import type { Transport } from 'lipra-transports';
import type { LogRecord } from 'lipra';

function emit(transport: Transport, record: LogRecord): void {
  transport.write(record);
}
```

## Error handling

```ts
try {
  throw new Error('database unavailable');
} catch (err) {
  logger.error(err);
}
```

This serializes the error into a structured object with message and stack details.

## Context helpers

```ts
import { runWithContext, getContext } from 'lipra';

runWithContext({ requestId: 'abc-123' }, () => {
  console.log(getContext());
});
```

These helpers are useful when you want request-scoped metadata without threading values through every function call manually.

`runWithContext` and `withContext` return the callback's result and keep the context scoped to that callback's asynchronous execution.

## Redaction

```ts
import { redactValue } from 'lipra';

const payload = {
  user: { email: 'a@example.com', password: 'secret' }
};

const safe = redactValue(payload, ['user.password']);
console.log(safe);
// { user: { email: 'a@example.com', password: '[REDACTED]' } }
```

## TypeScript

lipra ships with TypeScript declarations and supports a strict TypeScript setup.

```ts
import { logger, type LogRecord, type LogLevel } from 'lipra';

const level: LogLevel = 'warn';
const record: LogRecord = {
  time: new Date().toISOString(),
  level,
  msg: 'warning',
  fields: { ok: false }
};

logger.info(record.msg, record.fields);
```

## License

MIT

