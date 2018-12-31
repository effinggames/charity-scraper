require('ts-node').register();
require('tsconfig-paths').register();
const { PostgresConnectionString } = require('shared/Constants');

module.exports = {
  client: 'pg',
  connection: PostgresConnectionString,
  migrations: {
    tableName: 'knex_migrations'
  }
};
