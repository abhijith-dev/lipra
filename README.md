# lipra

A high-level, human-friendly logger for Node.js services and CLIs.

lipra is designed for the gap between plain console logs and heavy structured loggers: pretty output in development, JSON output in production, and a small API that stays easy to use in real apps.

## Features

- leveled logging: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- pretty console output in TTY terminals
- JSON output when stdout is not a TTY
- child loggers with a `scope`
- structured error serialization
- async context helpers
- redaction helpers
- package-ready ESM/CJS builds

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

Example output in a TTY:

```txt
16:20:34 INFO [auth] User login ok {"userId":"abc123"}
```

Example output in JSON mode:

```json
{"time":"2026-09-16T16:20:34.123Z","level":"info","msg":"Server starting","fields":{"port":3000}}
```

## API

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

## Configuration

The logger supports a few configuration knobs through the `LoggerOptions` object.

```ts
import { Logger } from 'lipra';

const logger = new Logger({
  level: 'info',
  format: 'auto', // 'pretty' | 'json' | 'auto'
  scope: 'service-a'
});
```

### Format behavior

- `pretty`: always writes pretty output
- `json`: always writes JSON output
- `auto`: uses pretty for TTY, JSON for non-TTY

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

## Project structure

This monorepo includes:

```txt
lipra/
├── package.json
├── README.md
├── packages/
│   └── core/
│       ├── src/
│       ├── package.json
│       └── dist/
└── pnpm-workspace.yaml
```


## Roadmap

The current implementation is the foundation for the full design spec. Planned additions include:

- spinner-aware terminal rendering
- file and stream transports
- JSONL logging and real structured output controls
- request-scoped context binding
- framework integrations such as Express and Fastify

## License

MIT

