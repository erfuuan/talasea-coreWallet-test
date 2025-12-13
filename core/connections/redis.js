import Redis from 'ioredis';
// import appConfig from '../config/application.js';
import chalk from 'chalk'
// const redis = new Redis(appConfig.redis);
const redisServer = new Redis({
  host: 'localhost',
  port: 6379,
});


redisServer.on('connect', () => {
  console.log(chalk.green('✔  [success] redis connected successfully'));
})

// Log Redis 
redisServer.on('error', (error) => {
  console.log(chalk.red(`✗  [error] Redis Client error: ${error}`));
});

export { redisServer };