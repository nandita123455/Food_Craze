const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`🔥 Master process ${process.pid} starting...`);
  console.log(`💻 CPU Cores: ${numCPUs}`);
  console.log(`🚀 Spawning ${numCPUs} worker processes...\n`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Restart dead workers
  cluster.on('exit', (worker, code, signal) => {
    console.log(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
  
  // Health monitoring
  setInterval(() => {
    const workers = Object.keys(cluster.workers).length;
    console.log(`✅ Active workers: ${workers}/${numCPUs}`);
  }, 30000);
  
} else {
  require('./server');
  console.log(`✅ Worker ${process.pid} started`);
}
