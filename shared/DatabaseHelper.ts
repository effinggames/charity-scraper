import { Connection, createConnection } from 'typeorm';
import { postgresConnectionString } from './Constants';
import { parseConnectionString } from 'shared/Utils';

/**
 * Initializes the shared db connection pool.
 */
let connection: Promise<Connection>;

export function getConnection(): Promise<Connection> {
  if (!connection) {
    const data = parseConnectionString(postgresConnectionString);

    connection = createConnection({
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
  }

  return connection;
}

getConnection();
