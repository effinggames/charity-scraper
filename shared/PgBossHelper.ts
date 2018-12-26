import * as Cluster from 'cluster';
import * as PgBoss from 'pg-boss';
import * as url from 'url';
import { PostgresConnectionString } from './Constants';

function parseConnectionString(connectionString: string): PgBoss.DatabaseOptions {
  const parseQuerystring = true;
  const params = url.parse(connectionString, parseQuerystring);
  params.pathname = params.pathname || '';
  params.port = params.port || '';
  params.auth = params.auth || '';
  const auth = params.auth ? params.auth.split(':') : [];

  const parsed: PgBoss.DatabaseOptions = {
    database: params.pathname.split('/')[1],
    host: params.hostname,
    port: parseInt(params.port, 10),
    ssl: !!params.query.ssl,
    user: auth[0],
  };

  if (auth.length === 2) {
    parsed.password = auth[1];
  }

  return parsed;
}

/**
 * Direct access to the PgBoss instance.
 */
const constructorOptions = parseConnectionString(PostgresConnectionString);
constructorOptions.poolSize = Cluster.isWorker ? 2 : 10;
export const boss = new PgBoss(constructorOptions);

/**
 * Substitute subscribe function that only allows 1 concurrent job.
 * @param jobName Job name in the queue.
 * @param jobHandler Function that accepts a job parameter.
 * @param pollingFrequency The polling frequency in ms.
 */
export function subscribe<ReqData, ResData>(
  jobName: string,
  jobHandler: PgBoss.SubscribeHandler<ReqData, ResData>,
  pollingFrequency = 1000,
): void {
  function fetchJob(): void {
    boss
      .fetch(jobName)
      .then(jobHandlerWrapper)
      .catch(() => setTimeout(fetchJob, pollingFrequency));
  }

  function jobHandlerWrapper(job: PgBoss.JobWithDoneCallback<ReqData, ResData> | null): void {
    if (!job) {
      setTimeout(fetchJob, pollingFrequency);
    } else {
      job.done = () => {
        fetchJob();
        return boss.complete(job.id);
      };
      jobHandler(job, job.done);
    }
  }

  boss.start().then(fetchJob);
}
