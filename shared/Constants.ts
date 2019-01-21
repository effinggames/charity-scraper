import { getEnvVarOrThrow } from '@effinggames/ts-core-utils';

/**
 * The PgBoss queue names.
 */
export enum JobQueueNames {
  EXTRACT_XML = 'EXTRACT_XML'
}

// Shared Mandatory Env Variables
export const postgresConnectionString = getEnvVarOrThrow('DATABASE_URL');
