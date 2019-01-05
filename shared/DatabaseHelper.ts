import { parseConnectionString } from 'shared/Utils';
import { Connection, createConnection } from 'typeorm';
import { postgresConnectionString } from './Constants';

const data = parseConnectionString(postgresConnectionString);

const connection = createConnection({
  database: data.database,
  port: data.port,
  host: data.host,
  username: data.username,
  password: data.password,
  type: 'postgres',
  entities: [`${__dirname}/entities/*.ts`],
  synchronize: true,
  extra: { min: 1, max: 2 }
});

/**
 * Returns the shared db connection pool.
 * Initalizes if it doesn't exist yet.
 */
export function getConnection(): Promise<Connection> {
  return connection;
}
