import * as Knex from 'knex';
import { postgresConnectionString } from './Constants';

/**
 * Initializes the shared db connection pool.
 */
export const knex = Knex({
  client: 'pg',
  connection: postgresConnectionString,
  pool: { min: 1, max: 1 }
});
