import * as Url from 'url';

/**
 * Breaks an array into specified chunk sizes.
 * @param array The array to break apart.
 * @param chunkSize What size the chunks should be.
 * @returns Returns an array of arrays.
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const results: T[][] = [];

  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }

  return results;
}

export function getEnvVarOrThrow(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`ENV variable: ${name} is not set!`);
  }

  return value;
}

export function parseConnectionString(connectionString: string) {
  const params = Url.parse(connectionString, true);

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

export function mapSafely<T, K>(value: T | undefined, mapFunc: (value: T) => K): K | undefined {
  let result;

  if (value !== undefined) {
    result = mapFunc(value);
  }

  return result;
}

export function getSafely<T>(getCb: () => T | undefined): T | undefined {
  let result;

  try {
    result = getCb();
  } finally {
    return result;
  }
}

export function getOrThrow<T>(getCb: () => T | undefined): T {
  const result = getSafely(getCb);

  if (result === undefined) {
    throw new Error('getOrThrow - undefined value!');
  }

  return result;
}

export function getOrElse<T>(getCb: () => T | undefined, defaultValue: T): T {
  let result = getSafely(getCb);

  if (result === undefined) {
    result = defaultValue;
  }

  return result;
}
