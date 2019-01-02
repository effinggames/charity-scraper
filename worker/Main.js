const Cluster = require('cluster');

function startAppWithCluster(initCb) {
  if (Cluster.isMaster) {
    let cpuCount;

    if (process.env.NODE_ENV === 'production') {
      console.log('Running in production mode!');
      cpuCount = require('os').cpus().length;
    } else {
      console.warn("Running in development mode, set NODE_ENV to 'production' for multi-core support.");
      cpuCount = 1;
    }

    for (let i = 0; i < cpuCount; i++) {
      Cluster.fork();
    }

    Cluster.on('exit', (worker) => {
      console.log('Worker %d died :(', worker.id);
      Cluster.fork();
    });
  } else {
    initCb();
  }
}

startAppWithCluster(() => {
  require('ts-node').register();
  require('tsconfig-paths').register();
  require('./Worker');

  console.log('Worker %d running!', Cluster.worker.id);
});
