import { parse as parseUrl } from 'url';

/**
 * Useful for generic functions that need to extend from objects.
 */
export interface ObjectLiteral {
  [key: string]: any;
}

/**
 * Breaks an array into specified chunk sizes.
 * @param array The array to break apart.
 * @param chunkSize What size the chunks should be.
 * @returns Returns an array of arrays.
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const results: T[][] = [];
  const arrayClone = array.slice();
  const numOfChunks = Math.ceil(arrayClone.length / chunkSize);

  for (let i = 0; i < numOfChunks; i++) {
    results.push(arrayClone.splice(0, chunkSize));
  }

  return results;
}

/**
 * Gets the environment variable or throws an error.
 * @param name Name of the env variable.
 * @returns Returns the value of the env variable.
 */
export function getEnvVarOrThrow(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`ENV variable: ${name} is not set!`);
  }

  return value;
}

/**
 * Parses a database connection string into easier pieces.
 * @param connectionString Connection string like 'postgres://USER:PASSWORD@DATABASE_URL/DATABASE_NAME'.
 * @returns Returns an object with the connection data.
 */
export function parseConnectionString(
  connectionString: string
): {
  database: string;
  host: string;
  port: number;
  ssl: boolean;
  username: string;
  password: string;
} {
  const params = parseUrl(connectionString, true);

  params.pathname = params.pathname || '';
  params.hostname = params.hostname || '';
  params.port = params.port || '';
  params.auth = params.auth || '';
  const auth = params.auth.split(':');

  return {
    database: params.pathname.split('/')[1],
    host: params.hostname,
    port: parseInt(params.port, 10),
    ssl: !!params.query.ssl,
    username: auth[0],
    password: auth[1]
  };
}

/**
 * Maps a possibly undefined value to another value.
 * @param value The value to transform.
 * @param mapFunc The transform function.
 * @returns Returns the possibly undefined new value.
 */
export function mapSafely<T, K>(value: T | undefined, mapFunc: (value: T) => K): K | undefined {
  let result;

  if (value !== undefined) {
    result = mapFunc(value);
  }

  return result;
}

/**
 * Gets the possibly undefined value from the callback.
 * If the callback throws an error, then returns undefined.
 * Useful when accessing a dangerous interface or 'any'.
 * @param getCb Callback that accesses the value.
 * @returns Returns the value or undefined.
 */
export function getSafely<T>(getCb: () => T | undefined): T | undefined {
  let result;

  try {
    result = getCb();
  } finally {
    return result;
  }
}

/**
 * Gets the possibly undefined value from the callback.
 * If the callback throws an error or returns undefined, then throws an error.
 * Useful when accessing a dangerous interface or 'any' that's mandatory.
 * @param getCb Callback that accesses the value.
 * @returns Returns the value.
 */
export function getOrThrow<T>(getCb: () => T | undefined): T {
  const result = getSafely(getCb);

  if (result === undefined) {
    throw new Error('getOrThrow - undefined value!');
  }

  return result;
}

/**
 * Gets the possibly undefined value from the callback.
 * If the callback throws an error, then returns the provided default value.
 * Useful when accessing a dangerous interface or 'any'.
 * @param getCb Callback that accesses the value.
 * @param defaultValue Fallback value if the callback errors or returns undefined.
 * @returns Returns the callback value or the default value.
 */
export function getOrElse<T>(getCb: () => T | undefined, defaultValue: T): T {
  let result = getSafely(getCb);

  if (result === undefined) {
    result = defaultValue;
  }

  return result;
}

/**
 * Checks if a value is defined, in a type-safe way.
 * Useful for filtering through arrays.
 * @param value The value to check.
 * @returns Returns true/false if the value is defined.
 */
export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Initializes a class and copies over additional properties.
 * @param entityClass The class to initialize.
 * @param partials The properties to copy over to the new object.
 * @returns Returns the new instance.
 */
export function initWithProps<T extends ObjectLiteral>(entityClass: { new (): T }, ...partials: Partial<T>[]): T {
  const entity = new entityClass();

  return Object.assign(entity, ...partials);
}
