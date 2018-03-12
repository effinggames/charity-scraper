import * as Request from 'request-promise-native';
import {boss} from 'shared/PgBossHelper';
import {JobQueueTypes} from 'shared/Constants';
import {EXTRACT_XML_PAYLOAD} from 'shared/Types';

/**
 * Breaks an array into specified chunk sizes.
 * @param array The array to break apart.
 * @param chunkSize What size the chunks should be.
 * @returns Returns an array of arrays.
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const results: T[][] = [];

  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }

  return results;
}

/**
 * Gets all the form 990 xml urls for a specified year.
 * Then adds it to a job queue to be extracted in batches.
 * @param year The year of charity data to download.
 * @returns Returns a promise when all the job queue jobs finished submitting.
 */
async function getCharityFilingsForYear(year: string): Promise<(string | null)[]> {
  const awsUrl = `https://s3.amazonaws.com/irs-form-990/index_${year}.json`;
  console.log(`Loading xml urls for ${awsUrl}`);

  const json: any = await Request.get(awsUrl, {json: true});
  const xmlUrls: string[] = json[`Filings${year}`].map((data: any) => data.URL);
  console.log(`${xmlUrls.length} xml urls loaded`);

  const promises = chunkArray(xmlUrls, 100).map(function(urls) {
    const payload: EXTRACT_XML_PAYLOAD = {urls: urls};
    return boss.publish(JobQueueTypes.EXTRACT_XML, payload, {expireIn: '9999 years'});
  });

  return Promise.all(promises);
}

(async function init(): Promise<void> {
  const years = process.argv.slice(2);

  // Verify args are the correct format.
  const isValidInput = years.every(function(year) {
    return /^\d+$/.test(year);
  });

  if (isValidInput && years.length > 0) {
    await boss.start();
    for (const year of years) {
      await getCharityFilingsForYear(year);
    }
    console.log('Great success!');
    process.exit(0);
  } else {
    console.log('Error: every arg must be a year starting from 2011');
    console.log('Example usage: npm run scraper -- 2011 2012');
    process.exitCode = 1;
  }
})();
