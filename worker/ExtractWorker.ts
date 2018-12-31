import * as PgBoss from 'pg-boss';
import * as Request from 'request-promise-native';
import { JobQueueTypes } from 'shared/Constants';
import { boss, subscribe } from 'shared/PgBossHelper';
import { defaultErrorHandler } from 'shared/PromiseHelper';
import { ExtractXMLPayload, ParseJSONPayload } from 'shared/Types';
import { promisify } from 'typed-promisify';
import * as Xml2js from 'xml2js';

const parseString = promisify(Xml2js.parseString);

async function jobHandler(job: PgBoss.JobWithDoneCallback<ExtractXMLPayload, any>) {
  const xmlUrls: string[] = job.data.urls;

  const promises = xmlUrls
    .map(async (url) => {
      const xml: string = await Request.get(url);
      const json: any = await parseString(xml, { explicitArray: false });
      const payload: ParseJSONPayload = { charityData: json };

      return boss.publish(JobQueueTypes.PARSE_JSON, payload, { expireIn: '9999 years' });
    })
    .map(defaultErrorHandler);

  try {
    await Promise.all(promises);
  } finally {
    console.log('Job done');
    job.done(null, null);
  }
}

async function init(): Promise<void> {
  console.log('Starting extract worker');
  subscribe(JobQueueTypes.EXTRACT_XML, jobHandler);
}

init();
