import { postgresConnectionString } from './Constants';
import { parseConnectionString } from './Utils';
import * as PgBoss from 'pg-boss';

const data = parseConnectionString(postgresConnectionString);

const constructorOptions: PgBoss.DatabaseOptions = {
  database: data.database,
  host: data.host,
  port: data.port,
  ssl: data.ssl,
  user: data.username,
  password: data.password,
  poolSize: 2
};

const bossPromise = new PgBoss(constructorOptions).start();

/**
 * Export access to the shared PgBoss instance.
 */
export function getPgBoss(): Promise<PgBoss> {
  return bossPromise;
}

/**
 * Wrapper subscribe function that only allows 1 concurrent job.
 * @param jobName Job name in the queue.
 * @param jobHandler Function that accepts a job parameter.
 * @param [jobConcurrency=1] The number of jobs to run at the same time.
 * @param [pollingFrequency=1000] The polling frequency in ms.
 */
export async function subscribe<ReqData, ResData>(
  jobName: string,
  jobHandler: PgBoss.SubscribeHandler<ReqData, ResData>,
  jobConcurrency: number = 1,
  pollingFrequency: number = 1000
): Promise<void> {
  const boss = await getPgBoss();
  const subscribeOptions: PgBoss.SubscribeOptions = {
    teamConcurrency: jobConcurrency,
    newJobCheckInterval: pollingFrequency
  };

  return await boss.subscribe(jobName, subscribeOptions, jobHandler);
}
