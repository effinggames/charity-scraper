import * as Knex from 'knex';
import { PostgresConnectionString } from './Constants';

/**
 * Initializes the shared db connection pool.
 */
export const knex = Knex({
  client: 'pg',
  connection: PostgresConnectionString,
  pool: { min: 1, max: 1 },
});
