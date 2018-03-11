const Cluster = require('cluster');

if (Cluster.isMaster) {
  let cpuCount = require('os').cpus().length;

  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode!');
  } else {
    console.log(
      "Running in development mode, set NODE_ENV to 'production' for multi-core support."
    );
    cpuCount = 1;
  }

  for (let i = 0; i < cpuCount; i++) {
    Cluster.fork();
  }

  Cluster.on('exit', worker => {
    console.log('Worker %d died :(', worker.id);
    Cluster.fork();
  });
} else {
  require('ts-node').register();
  require('tsconfig-paths').register();
  require('./ExtractWorker');
  console.log('Worker %d running!', Cluster.worker.id);
}
