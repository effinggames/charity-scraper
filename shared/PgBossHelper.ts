import * as PgBoss from 'pg-boss';

/**
 * Substitute subscribe function that only allows 1 concurrent job.
 * @param boss PgBoss instance.
 * @param jobName Job name in the queue.
 * @param jobHandler Function that accepts a job parameter.
 * @param pollingFrequency The polling frequency in ms.
 */
export function subscribe<ReqData, ResData>(
  boss: PgBoss,
  jobName: string,
  jobHandler: PgBoss.SubscribeHandler<ReqData, ResData>,
  pollingFrequency = 1000
) {
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
      job.done = function() {
        fetchJob();
        return boss.complete(job.id);
      };
      jobHandler(job, job.done);
    }
  }

  fetchJob();
}
