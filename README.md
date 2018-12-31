Charity-Scraper
=================
Using Node.js, Typescript, and Postgres.   

Downloads Form 990 charity data from AWS, converts it to json, and puts it in a Postgres job queue to be processed later. Since there can be over 200k entries per year, designed it as an initial scraping script + worker server. The scraping script gets the data urls of all the charities and batches them as jobs for the worker server to download and parse.   

### Usage:

```
git clone ...
npm install
npm run worker (in separate tab)
npm run scraper -- 2011 2012 2013 2014 2015 2016 2017 2018
```

Env variables:  
`DATABASE_URL`: Postgres connection string.   
`NODE_ENV`: Set to 'production' for multi-core worker support.   