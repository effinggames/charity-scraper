function getEnvVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`ENV variable: ${name} is not set!`);
  }

  return value;
}

export enum JobQueueNames {
  EXTRACT_XML = 'EXTRACT_XML'
}

// Mandatory Env Variables
export const postgresConnectionString = getEnvVariable('DATABASE_URL');
