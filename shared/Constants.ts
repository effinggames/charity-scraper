import { getEnvVarOrThrow } from './Utils';

/**
 * The PgBoss queue names.
 */
export enum JobQueueNames {
  EXTRACT_XML = 'EXTRACT_XML'
}

// Shared Mandatory Env Variables
export const postgresConnectionString = getEnvVarOrThrow('DATABASE_URL');
