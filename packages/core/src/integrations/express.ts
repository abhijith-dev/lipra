import { randomUUID } from 'node:crypto';

import { runWithContext } from '../core/context';
import type { Logger } from '../core/logger';

export interface ExpressLoggerOptions {
  /** Header used to read/assign the request id. Defaults to `x-request-id`. */
  headerName?: string;
}

/**
 * Express middleware: assigns/reads a request id, runs the request inside
 * `runWithContext`, and logs request start/finish (method/path/status/duration).
 */
export function expressLogger(logger: Logger, options: ExpressLoggerOptions = {}) {
  const headerName = options.headerName ?? 'x-request-id';

  return function lipraExpressMiddleware(req: any, res: any, next: (err?: unknown) => void): void {
    const requestId = (req.headers?.[headerName] as string | undefined) ?? randomUUID();
    res.setHeader?.(headerName, requestId);

    runWithContext({ requestId }, () => {
      const start = Date.now();
      const path = req.path ?? req.url;

      logger.info('request start', { method: req.method, path, requestId });

      res.on?.('finish', () => {
        logger.info('request finish', {
          method: req.method,
          path,
          status: res.statusCode,
          durationMs: Date.now() - start,
          requestId,
        });
      });

      next();
    });
  };
}
