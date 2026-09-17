# lipra

<p align="center">
  <img src="./lipra.png" alt="Lipra logo" width="360" />
</p>

A small, structured logger for Node.js services, CLIs, and backend apps. `lipra` gives you readable colored logs in development and clean JSON records in production and CI.

## Why developers pick lipra

- friendly terminal output for local debugging
- structured records for log aggregation and monitoring
- simple API with child loggers, context, and redaction
- zero-friction Express and Fastify integration
- ESM and CJS support in the same package
- production-safe output without extra setup

## Features

- leveled logging: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- pretty colored output in TTY terminals and JSON output when stdout is not a TTY
- `auto`, `pretty`, and `json` modes
- configurable transports: `ConsoleTransport`, `FileTransport`, and `StreamTransport`
- multiple transports per logger instance
- child loggers with scoped metadata and overrides
- async context propagation with `runWithContext` and `getContext`
- structured error serialization with stack traces and `cause`
- redaction helpers for secrets and PII
- terminal spinner support for long-running tasks
- framework integrations for Express and Fastify
- strict TypeScript support and dual package output

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

### Example output in development

```txt
16:20:34 INFO [auth] User login ok {"userId":"abc123"}
```

### Example output in JSON mode

```json
{"time":"2026-09-16T16:20:34.123Z","level":"info","msg":"Server starting","fields":{"port":3000}}
```

## Core API

### Default logger

```ts
import { logger } from 'lipra';
```

### Logging methods

```ts
logger.trace('trace message', { foo: 'bar' });
logger.debug('debug message', { step: 2 });
logger.info('info message', { env: 'dev' });
logger.warn('warning message', { retry: true });
logger.error('request failed', { route: '/api/users' });
logger.error(new Error('db down'));
logger.fatal('process crashed', { exitCode: 1 });
```

### Level filtering

`Logger` compares each record's level weight against the configured threshold and drops lower-priority records.

```ts
import { Logger } from 'lipra';

const appLogger = new Logger({ level: 'warn' });
appLogger.info('this is suppressed');
appLogger.warn('this is emitted');
```

The order is:

```txt
trace < debug < info < warn < error < fatal
```

### Child logger

```ts
import { logger } from 'lipra';

const authLogger = logger.child({ module: 'auth' });
authLogger.info('User login ok', { userId: 'abc123' });
```

Child loggers keep parent metadata and append scope information to every record.

```ts
const debugChild = logger.child({ module: 'jobs' }, { level: 'debug' });
```

### Custom logger instance

```ts
import { Logger } from 'lipra';

const appLogger = new Logger({
  level: 'debug',
  format: 'pretty',
  scope: 'api',
});

appLogger.info('Boot complete', { port: 3000 });
```

## Configuration

```ts
import { Logger } from 'lipra';

const appLogger = new Logger({
  format: 'auto', // 'pretty' | 'json' | 'auto'
  scope: 'service-a',
  level: 'info',
});
```

### Output modes

- `pretty`: always writes human-friendly terminal output
- `json`: always writes JSON records
- `auto`: uses pretty output for TTYs and JSON output elsewhere

### Color behavior

`lipra` respects terminal capabilities and environment variables:

- TTY output is colored automatically
- non-TTY output is plain text or JSON
- `NO_COLOR` disables color
- `FORCE_COLOR` forces color output

## Transports

A logger can emit each record to one or more transports.

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

`StreamTransport` writes to any Node.js writable stream:

```ts
import { StreamTransport } from 'lipra';

const appLogger = new Logger({ transports: [new StreamTransport(process.stderr)] });
```

Each transport supports an independent `minLevel` filter.

## Structured errors

```ts
try {
  throw new Error('database unavailable');
} catch (err) {
  logger.error(err);
}
```

`lipra` serializes errors into structured data with fields such as:

- `name`
- `message`
- `stack`
- `cause`

## Context helpers

```ts
import { runWithContext, getContext } from 'lipra';

runWithContext({ requestId: 'abc-123' }, () => {
  console.log(getContext());
});
```

This keeps request-scoped metadata available across async work without leaking state globally.

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

For convenience, `redactFields` wraps a logger and automatically redacts selected properties:

```ts
import { logger, redactFields } from 'lipra';

const safeLogger = redactFields(logger, ['password', 'user.ssn']);
safeLogger.info('login attempt', {
  user: { ssn: '123-45-6789' },
  password: 'secret',
});
```

## Spinner helper

`withSpinner` shows a terminal spinner while an async task runs, then logs the final status and duration.

```ts
import { logger, withSpinner } from 'lipra';

await withSpinner(logger, 'Migrating database', async () => {
  await runMigrations();
});
```

## Framework integrations

### Express

```ts
import express from 'express';
import { logger } from 'lipra';
import { expressLogger } from 'lipra/express';

const app = express();
app.use(expressLogger(logger));
```

This adds request lifecycle logging including request ID, method, path, status, and duration.

### Fastify

```ts
import Fastify from 'fastify';
import { logger } from 'lipra';
import { lipraFastifyPlugin } from 'lipra/fastify';

const app = Fastify();
app.register(lipraFastifyPlugin(logger));
```

## Optional standalone transports package

The `lipra-transports` package can write `LogRecord` values to stdout or any writable stream independently from `Logger`.

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

## TypeScript support

`lipra` ships with TypeScript declarations and works well in strict TypeScript applications.

```ts
import { logger, type LogRecord, type LogLevel } from 'lipra';

const level: LogLevel = 'warn';
const record: LogRecord = {
  time: new Date().toISOString(),
  level,
  msg: 'warning',
  fields: { ok: false },
};

logger.info(record.msg, record.fields);
```

## Local development

```bash
git clone https://github.com/your-username/lipra.git
cd lipra
pnpm install
pnpm --filter lipra test
```

Examples of useful commands:

```bash
pnpm --filter lipra build
pnpm --filter lipra lint
pnpm --filter lipra test
```

## Roadmap

- richer formatting controls
- more advanced transport adapters
- improved terminal rendering for long-running tasks

## License

This project is licensed under the MIT License.

## Contributing

Contributions, issues, and feature ideas are welcome. If you want to improve the project, feel free to open an issue or submit a pull request.

