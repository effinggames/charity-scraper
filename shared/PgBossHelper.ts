import * as PgBoss from 'pg-boss';
import { postgresConnectionString } from './Constants';

const constructorOptions: PgBoss.DatabaseOptions = {
  connectionString: postgresConnectionString,
  poolSize: 2
};

const bossPromise = new PgBoss(constructorOptions).start();

/**
 * Gets the shared PgBoss instance.
 */
export function getPgBoss(): Promise<PgBoss> {
  return bossPromise;
}
