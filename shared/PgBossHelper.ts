import { parseConnectionString } from '@effinggames/ts-core-utils';
import * as PgBoss from 'pg-boss';
import { postgresConnectionString } from './Constants';

const data = parseConnectionString(postgresConnectionString);

const constructorOptions: PgBoss.DatabaseOptions = {
  database: data.database,
  host: data.host,
  port: data.port,
  ssl: data.ssl,
  user: data.username,
  password: data.password,
  poolSize: 2
};

const bossPromise = new PgBoss(constructorOptions).start();

/**
 * Gets the shared PgBoss instance.
 */
export function getPgBoss(): Promise<PgBoss> {
  return bossPromise;
}
