export function serializeErrorObject(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause,
    };
  }

  if (typeof err === 'string') {
    return { message: err };
  }

  if (err && typeof err === 'object') {
    return { ...err } as Record<string, unknown>;
  }

  return { message: String(err) };
}
