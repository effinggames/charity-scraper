import * as Request from 'request-promise-native';
import { JobQueueNames } from 'shared/Constants';
import { boss } from 'shared/PgBossHelper';
import { ExtractXMLPayload } from 'shared/Types';
import { chunkArray } from 'shared/Utils';

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

  const promises = chunkArray(xmlUrls, 100).map((urls) => {
    const payload: ExtractXMLPayload = { urls };

    return boss.publish(JobQueueNames.EXTRACT_XML, payload, { expireIn: '9999 years' });
  });

  return Promise.all(promises);
}

async function init(): Promise<void> {
  const years = process.argv.slice(2);

  // Verify args are the correct format.
  const isValidInput = years.every((year) => {
    return /^\d+$/.test(year);
  });

  if (isValidInput && years.length > 0) {
    await boss.start();

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
