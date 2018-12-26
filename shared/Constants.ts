function getEnvVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`ENV variable: ${name} is not set!`);
  }
  return value;
}

export const JobQueueTypes = {
  EXTRACT_XML: 'EXTRACT_XML',
  PARSE_JSON: 'PARSE_JSON',
};
export const DatabaseTables = {
  CHARITY_RAW_DATA: 'charity.raw_data',
};

// Mandatory Env Variables
export const PostgresConnectionString = getEnvVariable('DATABASE_URL');
