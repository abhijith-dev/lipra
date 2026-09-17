# lipra-transports

Optional output transports for [`lipra`](https://www.npmjs.com/package/lipra).

## Installation

```bash
npm install lipra lipra-transports
```

## Usage

```ts
import { ConsoleTransport, StreamTransport } from 'lipra-transports';
import type { LogRecord } from 'lipra';

const record: LogRecord = {
  time: new Date().toISOString(),
  level: 'info',
  msg: 'Server started',
};

new ConsoleTransport({ format: 'pretty' }).write(record);
new StreamTransport(process.stdout).write(record);
```