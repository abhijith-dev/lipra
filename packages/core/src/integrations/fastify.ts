import { randomUUID } from 'node:crypto';

import { runWithContext } from '../core/context';
import type { Logger } from '../core/logger';

export interface FastifyLoggerPluginOptions {
  /** Header used to read/assign the request id. Defaults to `x-request-id`. */
  headerName?: string;
}

/**
 * Fastify plugin: assigns/reads a request id, runs the request inside
 * `runWithContext`, and logs request start/finish (method/path/status/duration).
 */
export function lipraFastifyPlugin(logger: Logger, options: FastifyLoggerPluginOptions = {}) {
  const headerName = options.headerName ?? 'x-request-id';

  return function plugin(fastify: any, _opts: unknown, done: (err?: Error) => void): void {
    fastify.addHook('onRequest', (req: any, reply: any, hookDone: () => void) => {
      const requestId = (req.headers?.[headerName] as string | undefined) ?? randomUUID();
      reply.header(headerName, requestId);
      req.lipraContext = { requestId, start: Date.now() };

      runWithContext({ requestId }, () => {
        logger.info('request start', { method: req.method, path: req.url, requestId });
        hookDone();
      });
    });

    fastify.addHook('onResponse', (req: any, reply: any, hookDone: () => void) => {
      const context = req.lipraContext ?? { start: Date.now(), requestId: undefined };

      logger.info('request finish', {
        method: req.method,
        path: req.url,
        status: reply.statusCode,
        durationMs: Date.now() - context.start,
        requestId: context.requestId,
      });

      hookDone();
    });

    done();
  };
}

export default lipraFastifyPlugin;
