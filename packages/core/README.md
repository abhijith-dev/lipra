# lipra

A human-friendly structured logger for Node.js apps, CLIs, and services.

lipra fills the gap between plain `console.log` and heavy production loggers. It gives you clean, colored output in development and machine-readable JSON in production, without forcing a second toolchain.

## Why use lipra?

- pretty terminal logs in local development
- JSON output for CI, Docker, and production pipelines
- structured object logging with consistent payloads
- friendly API for apps, scripts, and services
- easy error serialization and scoped logging

## Features

- leveled logging: `trace`, `debug`, `info`, `warn`, `error`, `fatal` — filtered by `level`
- pretty, colored console output in TTY terminals; JSON when stdout is not a TTY; respects `NO_COLOR` / `FORCE_COLOR`
- pluggable transports (`ConsoleTransport`, `FileTransport`, `StreamTransport`), a `Logger` can write to several at once
- child loggers with a `scope` and persistent bound `fields`, with optional `level`/`format`/`transports` overrides
- structured error serialization
- async context helpers
- redaction helpers, including array indices and wildcards, plus an auto-redacting `redactFields` wrapper
- a `withSpinner` helper that logs task outcome/duration
- Express/Fastify integrations as subpath exports (`lipra/express`, `lipra/fastify`)
- ESM and CJS-friendly package output, including a working `require('lipra')`

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

Example pretty output:

```txt
16:20:34 INFO [auth] User login ok {"userId":"abc123"}
```

Example JSON output:

```json
{"time":"2026-09-16T16:20:34.123Z","level":"info","msg":"Server starting","fields":{"port":3000}}
```

## API

```ts
import { Logger, logger } from 'lipra';

logger.info('hello from lipra', { env: 'development' });
logger.error(new Error('db down'));

const requestLogger = new Logger({
  scope: 'api',
  format: 'pretty'
});

requestLogger.warn('request slow', { route: '/health' });
```

## Child loggers

```ts
import { logger } from 'lipra';

const authLogger = logger.child({ module: 'auth' });
authLogger.info('User login ok', { userId: 'abc123' });
```

## Context and redaction

```ts
import { getContext, redactValue, runWithContext } from 'lipra';

runWithContext({ requestId: 'abc-123' }, () => {
  console.log(getContext());
});

const payload = {
  user: { email: 'user@example.com', password: 'secret' }
};

console.log(redactValue(payload, ['user.password']));
```

## TypeScript support

lipra ships with TypeScript declarations and works well in strict TypeScript projects.

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
