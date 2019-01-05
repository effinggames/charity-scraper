import * as PgBoss from 'pg-boss';
import * as Request from 'request-promise-native';
import { JobQueueNames } from 'shared/Constants';
import { getConnection } from 'shared/DatabaseHelper';
import { saveCharity } from 'shared/entities/Charity';
import { saveFiling } from 'shared/entities/Filing';
import { subscribe } from 'shared/PgBossHelper';
import { defaultErrorHandler } from 'shared/PromiseHelper';
import { CharityForm990JSON, ExtractXMLPayload } from 'shared/Types';
import { promisify } from 'typed-promisify';
import * as Xml2js from 'xml2js';

const parseXMLString = promisify(Xml2js.parseString);

// Parses the form 990 XML, updates the charity,
// and then inserts or updates the filing.
async function jobHandler(job: PgBoss.JobWithDoneCallback<ExtractXMLPayload, any>): Promise<void> {
  const xmlUrls: string[] = job.data.urls;
  let counter = 0;

  const promises = xmlUrls
    .map(async (url) => {
      const xml: string = await Request.get(url);
      const json: CharityForm990JSON = await parseXMLString(xml, { explicitArray: false });
      const charity = await saveCharity(json);

      await saveFiling(charity, json);
      counter += 1;
    })
    .map(defaultErrorHandler);

  try {
    await Promise.all(promises);
  } finally {
    console.log(`[${JobQueueNames.EXTRACT_XML}] job done - ${counter} filings added or updated.`);
  }
}

async function init(): Promise<void> {
  console.log('Starting extract worker');
  // Initializes database connection.
  await getConnection();
  subscribe(JobQueueNames.EXTRACT_XML, jobHandler);
}

init();
