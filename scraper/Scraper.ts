import * as Request from 'request-promise-native';
import { JobQueueNames } from 'shared/Constants';
import { getPgBoss } from 'shared/PgBossHelper';
import { executeInBatches } from 'shared/PromiseHelper';
import { ExtractXMLPayload } from 'shared/Types';
import { chunkArray } from 'shared/Utils';

const XML_URL_BATCH_SIZE = 100;
const PUBLISH_CONCURRENCY_RATE = 2;

/**
 * Gets all the form 990 xml urls for a specified year.
 * Then adds it to a job queue to be extracted in batches.
 * @param year The year of charity data to download.
 * @returns Returns a promise when all the job queue jobs finished submitting.
 */
async function getCharityFilingsForYear(year: string): Promise<(string | null)[]> {
  const awsUrl = `https://s3.amazonaws.com/irs-form-990/index_${year}.json`;

  console.log(`Loading xml urls for ${awsUrl}`);

  const json: any = await Request.get(awsUrl, { json: true });
  const xmlUrls: string[] = json[`Filings${year}`].map((data: any) => data.URL);

  console.log(`${xmlUrls.length} xml urls loaded`);

  const urlChunks = chunkArray(xmlUrls, XML_URL_BATCH_SIZE);
  const payloads: ExtractXMLPayload[] = urlChunks.map((urls) => ({ urls }));
  const boss = await getPgBoss();

  const promiseFuncs = payloads.map((payload) => {
    return () => boss.publish(JobQueueNames.EXTRACT_XML, payload, { expireIn: '9999 years' });
  });

  return executeInBatches(promiseFuncs, PUBLISH_CONCURRENCY_RATE);
}

async function init(): Promise<void> {
  const years = process.argv.slice(2);

  // Verify args are the correct format.
  const isValidInput = years.every((year) => {
    return /^\d+$/.test(year);
  });

  if (isValidInput && years.length > 0) {
    for (const year of years) {
      await getCharityFilingsForYear(year);
    }

    console.log('Great success!');
  } else {
    console.log('Error: every arg must be a year starting from 2011');
    console.log('Example usage: npm run scraper -- 2011 2012');
    process.exitCode = 1;
  }
}

init();
