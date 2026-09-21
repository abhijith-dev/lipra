# lipra

<p align="center">
  <img src="./lipra.png" alt="Lipra logo" width="360" />
</p>

This project has a [Code of Conduct](./CODE_OF_CONDUCT.md).

## Table of contents

- Table of contents
- Installation
- Features
- Docs & Community
- Quick Start
- Philosophy
- Examples
- Contributing
  - Security Issues
  - Running Tests
- Current project team members
  - TC (Technical Committee)
    - TC emeriti members
  - Triagers
    - Emeritus Triagers
- License

<div align="center">

[![npm](https://img.shields.io/npm/v/lipra.svg)](https://www.npmjs.com/package/lipra)
[![downloads](https://img.shields.io/npm/dm/lipra.svg)](https://www.npmjs.com/package/lipra)
[![ci](https://img.shields.io/github/actions/workflow/status/abhijith-dev/lipra/npm.yml?branch=main)](https://github.com/abhijith-dev/lipra/actions/workflows/npm.yml)
[![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/abhijith-dev/lipra)
[![license](https://img.shields.io/github/license/abhijith-dev/lipra)](./LICENSE)

</div>

## Installation

```bash
npm install lipra
# or
pnpm add lipra
# or
yarn add lipra
```

## Features

- readable terminal logs for local debugging
- structured records for CI, Docker, and production logs
- `trace`, `debug`, `info`, `warn`, `error`, and `fatal` levels
- pretty and JSON output modes
- child loggers, fields, context, and redaction
- optional transports for console, file, and stream output
- Express and Fastify integrations
- strict TypeScript support
- ESM and CJS output

## Docs & Community

- package docs: this README and package examples
- issues: GitHub issues for bugs and feature requests
- support: open a discussion or issue in the repository

## Quick Start

```ts
import { logger } from 'lipra';

logger.info('Server starting', { port: 3000 });
logger.warn('Cache miss', { key: 'user:42' });
logger.error('Database failed', { service: 'api', tenant: 'acme' });
```

Example development output:

```txt
16:20:34 INFO [auth] User login ok {"userId":"abc123"}
```

Example JSON output:

```json
{"time":"2026-09-16T16:20:34.123Z","level":"info","msg":"Server starting","fields":{"port":3000}}
```

## Philosophy

`lipra` is built for developers who want clean logs without ceremony. It keeps the API small, the output readable, and the production path structured.

- keep developer logs human-friendly
- keep production logs machine-readable
- keep the mental model simple
- keep the package dependency-light

## Examples

### Basic logger

```ts
import { logger } from 'lipra';

logger.info('hello from lipra', { env: 'development' });
logger.error(new Error('db down'));
```

### Level filtering

```ts
import { Logger } from 'lipra';

const appLogger = new Logger({ level: 'warn' });
appLogger.info('hidden');
appLogger.warn('shown');
```

### Child logger

```ts
import { logger } from 'lipra';

const authLogger = logger.child({ module: 'auth' });
authLogger.info('user login ok', { userId: 'abc123' });
```

### Transport usage

```ts
import { ConsoleTransport, FileTransport, Logger } from 'lipra';

const appLogger = new Logger({
  transports: [
    new ConsoleTransport(),
    new FileTransport({ path: './app.log', minLevel: 'warn' }),
  ],
});

appLogger.info('console only');
appLogger.error('console and file');
```

## Contributing

Contributions are welcome. Please open an issue or pull request with a clear description of the change.

### Security Issues

Please do not disclose security issues publicly. Open a private security report through the repository maintainers or contact the project owner directly.

### Running Tests

```bash
pnpm install
pnpm --filter lipra test
``` 

## Current project team members

- TC (Technical Committee)
- TC emeriti members
- Triagers
- Emeritus Triagers

## License

MIT

