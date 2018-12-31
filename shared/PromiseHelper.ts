export function defaultErrorHandler<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch((err) => {
    console.error(err);

    return null;
  });
}
