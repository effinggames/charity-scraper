import * as PgBoss from 'pg-boss';
import * as Request from 'request-promise-native';
import { JobQueueNames } from 'shared/Constants';
import { getConnection } from 'shared/DatabaseHelper';
import Charity from 'shared/entities/Charity';
import Filing from 'shared/entities/Filing';
import { subscribe } from 'shared/PgBossHelper';
import { defaultErrorHandler, resolveAndFilter } from 'shared/PromiseHelper';
import { CharityForm990JSON, ExtractXMLPayload } from 'shared/Types';
import { promisify } from 'typed-promisify';
import * as Xml2js from 'xml2js';

const parseXMLString = promisify(Xml2js.parseString);

// Parses the form 990 XML, updates the charity,
// and then inserts or updates the filing.
async function jobHandler(job: PgBoss.JobWithDoneCallback<ExtractXMLPayload, any>): Promise<void> {
  const xmlUrls: string[] = job.data.urls;

  // Downloads all the charity XML files and converts to JSON.
  const jsonPromises = xmlUrls
    .map(async (url) => {
      const xml: string = await Request.get(url);
      const json: CharityForm990JSON = await parseXMLString(xml, { explicitArray: false });

      return json;
    })
    .map(defaultErrorHandler);

  const formJSONs = await resolveAndFilter(jsonPromises);
  const entities = formJSONs.map((json) => {
    const charity = Charity.createCharity(json);
    const filing = Filing.createFiling(charity, json);

    return { charity, filing };
  });

  const charities = entities.map((i) => i.charity);
  const filings = entities.map((i) => i.filing);

  await Charity.getRepository().save(charities);
  await Filing.getRepository().save(filings);

  console.log(`[${JobQueueNames.EXTRACT_XML}] job done - ${filings.length} filings added or updated.`);
}

async function init(): Promise<void> {
  console.log('Starting extract worker');
  // Initializes database connection.
  await getConnection();
  subscribe(JobQueueNames.EXTRACT_XML, jobHandler);
}

init();
