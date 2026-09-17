# lipra-transports

<p align="center">
  <img src="https://raw.githubusercontent.com/abhijith-dev/lipra/main/packages/transports/lipra.png" alt="Lipra logo" width="360" />
</p>

Optional output transports for [`lipra`](https://www.npmjs.com/package/lipra).

## Installation

```bash
npm install lipra lipra-transports
```

## Why use it?

- write structured log records to stdout or any writable stream
- keep transport logic separate from your app logger
- compatible with production and CLI environments
- works alongside the main `lipra` logger package

## Usage

```ts
import { ConsoleTransport, StreamTransport } from 'lipra-transports';
import type { LogRecord } from 'lipra';

const record: LogRecord = {
  time: new Date().toISOString(),
  level: 'info',
  msg: 'Server started',
  fields: { service: 'api', port: 3000 },
};

new ConsoleTransport({ format: 'auto' }).write(record);
new StreamTransport(process.stdout).write(record);
```

## Features

- `ConsoleTransport` for dev-friendly terminal logs
- `StreamTransport` for writing to any Node.js writable stream
- works with structured `LogRecord` objects emitted by `lipra`
- supports independent filtering and formatting per transport

## License

MIT