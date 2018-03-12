import * as Request from 'request-promise-native';
import * as PgBoss from 'pg-boss';
import * as Xml2js from 'xml2js';
import {promisify} from 'typed-promisify';
import {defaultErrorHandler} from 'shared/PromiseHelper';
import {boss, subscribe} from 'shared/PgBossHelper';
// import {knex} from 'shared/DatabaseHelper';
import {EXTRACT_XML_PAYLOAD, PARSE_JSON_PAYLOAD} from 'shared/Types';
import {JobQueueTypes} from 'shared/Constants';

const parseString = promisify(Xml2js.parseString);

async function jobHandler(job: PgBoss.JobWithDoneCallback<EXTRACT_XML_PAYLOAD, any>) {
  const xmlUrls: string[] = job.data.urls;

  const promises = xmlUrls
    .map(async function(url) {
      const xml: string = await Request.get(url);
      const json: any = await parseString(xml, {explicitArray: false});
      const payload: PARSE_JSON_PAYLOAD = {charityData: json};
      return boss.publish(JobQueueTypes.PARSE_JSON, payload, {expireIn: '9999 years'});
    })
    .map(defaultErrorHandler);

  try {
    await Promise.all(promises);
  } finally {
    console.log(`Job done`);
    job.done(null, null);
  }
}

(async function init(): Promise<void> {
  console.log('Starting extract worker');
  subscribe(JobQueueTypes.EXTRACT_XML, jobHandler);
})();
