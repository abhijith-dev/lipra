# lipra

A small, structured logger for Node.js services and CLIs. `lipra` produces colored, readable terminal output during local development and JSON records in non-interactive environments.

## Features

- leveled logging: `trace`, `debug`, `info`, `warn`, `error`, `fatal` — records below the configured `level` are dropped
- pretty, colored console output in TTY terminals (per-level colors via `picocolors`); plain JSON in non-TTY/CI, and respects `NO_COLOR` / `FORCE_COLOR`
- JSON output when stdout is not a TTY
- a pluggable `Transport` system: `ConsoleTransport` (default), `FileTransport`, `StreamTransport`, each with an optional independent `minLevel`
- a single `Logger` can fan out to multiple transports at once (e.g. console + file)
- child loggers with a `scope` and persistent bound `fields`, optionally overriding `level`/`format`/`transports`
- structured error serialization (`serializeError`), including `name`, `message`, `stack`, `cause`
- async context helpers (`runWithContext` / `getContext`)
- redaction helpers, including array indices and wildcard segments (`redactValue`), and an auto-redacting logger wrapper (`redactFields`)
- a spinner helper (`withSpinner`) that logs task outcome and duration, auto-disabled off a TTY
- Express and Fastify integrations, published as dependency-free subpath exports (`lipra/express`, `lipra/fastify`)
- ESM and CJS package output, including a working `require('lipra')` entry point
- optional standalone `lipra-transports` package for consumers that build/forward `LogRecord`s themselves

## Installation

```bash
npm install lipra
# or
pnpm add lipra
# or
yarn add lipra
```

## Quick start

```ts
import { logger } from 'lipra';

logger.info('Server starting', { port: 3000 });
logger.warn('Cache miss', { key: 'user:42' });
logger.error('Database failed', { service: 'api', tenant: 'acme' });
```

In a TTY, the default `auto` format produces colored output similar to:

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

All methods accept a message and optional structured fields. `error` also accepts an `Error`; its name, message, stack, and cause are serialized into the log record.

### Level filtering

`Logger` compares each record's level weight (`trace < debug < info < warn < error < fatal`) against `this.level` and skips emitting anything below it.

```ts
import { Logger } from 'lipra';

const appLogger = new Logger({ level: 'warn' });
appLogger.info('this is suppressed');
appLogger.warn('this is emitted');
```

### Child logger

```ts
import { logger } from 'lipra';

const authLogger = logger.child({ module: 'auth' });
authLogger.info('User login ok', { userId: 'abc123' });
```

`child()` merges the bindings into the parent's persistent `fields` (attached to every subsequent record) and appends to the `scope`. It also accepts optional overrides:

```ts
const debugChild = logger.child({ module: 'jobs' }, { level: 'debug' });
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

## Configuration

```ts
import { Logger } from 'lipra';

const appLogger = new Logger({
  format: 'auto', // 'pretty' | 'json' | 'auto'
  scope: 'service-a',
  level: 'info'
});
```

### Format behavior

- `pretty`: always writes pretty (optionally colored) output
- `json`: always writes JSON output
- `auto`: uses pretty for TTY, JSON for non-TTY

### Colors

Pretty output colors the level tag: `trace`=gray, `debug`=cyan, `info`=green, `warn`=yellow, `error`=red, `fatal`=bold red. Colors are automatically disabled when stdout is not a TTY, when `NO_COLOR` is set, and force-enabled when `FORCE_COLOR` is set.

## Transports

A `Logger` writes every record to all of its configured `transports` (default: a single `ConsoleTransport`).

```ts
import { ConsoleTransport, FileTransport, Logger } from 'lipra';

const appLogger = new Logger({
  transports: [
    new ConsoleTransport(),
    new FileTransport({ path: './app.log', minLevel: 'warn' }),
  ],
});

appLogger.info('only goes to console');
appLogger.error('goes to console and app.log');
```

`StreamTransport` writes to any `NodeJS.WritableStream`:

```ts
import { StreamTransport } from 'lipra';

const appLogger = new Logger({ transports: [new StreamTransport(process.stderr)] });
```

Each transport implements:

```ts
export interface Transport {
  write(record: LogRecord): void;
}
```

and may accept an independent `minLevel` filter, separate from the logger's own `level`.

## Error handling

```ts
try {
  throw new Error('database unavailable');
} catch (err) {
  logger.error(err);
}
```

This serializes the error into a structured object with `name`, `message`, and `stack`.

## Context helpers

```ts
import { runWithContext, getContext } from 'lipra';

runWithContext({ requestId: 'abc-123' }, () => {
  console.log(getContext());
});
```

`runWithContext` returns the callback's result and keeps the context scoped to that callback's asynchronous execution. `withContext` is a deprecated alias kept for backward compatibility.

## Redaction

```ts
import { redactValue } from 'lipra';

const payload = {
  user: { email: 'a@example.com', password: 'secret' },
  users: [{ password: 'a' }, { password: 'b' }],
};

redactValue(payload, ['user.password']);
// { user: { email: 'a@example.com', password: '[REDACTED]' }, ... }

redactValue(payload, ['users.*.password']);
// redacts password on every entry in the users array

redactValue(payload, ['users.0.password']);
// redacts only the first entry
```

`redactFields` returns a wrapped logger that auto-redacts the given paths on every call (including on `child()` loggers), so callers don't need to call `redactValue` manually each time:

```ts
import { logger, redactFields } from 'lipra';

const safeLogger = redactFields(logger, ['password', 'user.ssn']);
safeLogger.info('login attempt', { user: { ssn: '123-45-6789' }, password: 'secret' });
```

## Spinner

`withSpinner` shows a terminal spinner while an async task runs (skipped off a TTY) and logs the outcome (`ok`/`fail`) and duration through the given logger:

```ts
import { logger, withSpinner } from 'lipra';

await withSpinner(logger, 'Migrating database', async () => {
  await runMigrations();
});
```

## Framework integrations

Framework integrations are published as separate subpath exports so the core package stays dependency-free.

### Express

```ts
import express from 'express';
import { logger } from 'lipra';
import { expressLogger } from 'lipra/express';

const app = express();
app.use(expressLogger(logger));
```

Assigns/reads an `x-request-id` header, runs the request inside `runWithContext`, and logs request start/finish with method, path, status, and duration.

### Fastify

```ts
import Fastify from 'fastify';
import { logger } from 'lipra';
import { lipraFastifyPlugin } from 'lipra/fastify';

const app = Fastify();
app.register(lipraFastifyPlugin(logger));
```

## Optional standalone transports package

The `lipra-transports` package writes `LogRecord` values to stdout or any Node.js writable stream, independent of `Logger`. Use it when a service builds or forwards `LogRecord`s itself outside of a `Logger` instance.

```bash
npm install lipra lipra-transports
```

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

## Roadmap

- richer structured formatting controls
- animated (non-stub) terminal spinner rendering

## License

MIT

