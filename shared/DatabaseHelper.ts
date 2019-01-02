import { Connection, createConnection } from 'typeorm';
import { postgresConnectionString } from './Constants';
import { parseConnectionString } from 'shared/Utils';

/**
 * Initializes the shared db connection pool.
 */
let connection: Promise<Connection>;

export function getConnection(): Promise<Connection> {
  if (!connection) {
    const { database, host, port, username, password } = parseConnectionString(postgresConnectionString);

    connection = createConnection({
      database,
      port,
      host,
      username,
      password,
      type: 'postgres',
      entities: [`${__dirname}/entities/*.ts`],
      synchronize: true
    });
  }

  return connection;
}

getConnection();
