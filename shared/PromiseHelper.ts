import { chunkArray, flatten } from './Utils';

// A promise-returning function.
export interface PromiseFunction<T> {
  (): Promise<T>;
}

/**
 * Default error handler that logs the error, then returns null.
 * @param promise The promise to catch errors for.
 * @returns Returns the wrapped promise.
 */
export function defaultErrorHandler<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch((err) => {
    console.error(err);

    return null;
  });
}

/**
 * Takes an array of promise functions, and returns a single promise function.
 * @param promiseFuncs The promise-returning functions to flatten.
 * @returns Returns a promise function with all the results combined via Promise.all().
 */
function combinePromiseFunctions<T>(promiseFuncs: PromiseFunction<T>[]): () => Promise<T[]> {
  return () => {
    const promises = promiseFuncs.map((promiseFunc) => promiseFunc());

    return Promise.all(promises);
  };
}

/**
 * Executes a list of promise functions sequentially.
 * Chains all the promises together, then returns the complete result array at the end.
 * @param promiseFuncs The promise functions to execute sequentially.
 * @returns Returns a promise of the results.
 */
export function executeSequential<T>(promiseFuncs: PromiseFunction<T>[]): Promise<T[]> {
  const results: T[] = [];

  const promiseChain = promiseFuncs.reduce(async (promise, promiseFunc) => {
    await promise;
    const result = await promiseFunc();

    results.push(result);
  }, Promise.resolve());

  return promiseChain.then(() => results);
}

/**
 * Executes a list of promise functions sequentially, in batches.
 * Useful for throttling requests to even out server load.
 * @param promiseFuncs The promise functions to execute.
 * @param concurrencyRate How many promises to execute in each batch.
 * @returns Returns a promise of the results.
 */
export async function executeInBatches<T>(
  promiseFuncs: PromiseFunction<T>[],
  concurrencyRate: number = 5
): Promise<T[]> {
  const promiseFuncBatches = chunkArray(promiseFuncs, concurrencyRate).map(combinePromiseFunctions);

  const results = await executeSequential(promiseFuncBatches);

  return flatten(results);
}
